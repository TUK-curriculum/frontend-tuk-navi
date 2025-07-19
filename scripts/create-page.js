#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 명령행 인수 처리
const args = process.argv.slice(2);
const pageName = args[0];
const isProtected = args[1] === 'protected' || args[1] === 'true';

if (!pageName) {
  console.log('❌ 페이지 이름을 입력해주세요!');
  console.log('사용법: node scripts/create-page.js <페이지이름> [protected|public]');
  console.log('예시: node scripts/create-page.js MyPage protected');
  process.exit(1);
}

const pageNameCamel = pageName.charAt(0).toUpperCase() + pageName.slice(1);
const pageNameKebab = pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
const routePath = `/${pageNameKebab}`;

console.log(`🚀 ${pageNameCamel} 페이지를 생성합니다...`);
console.log(`📁 경로: ${routePath}`);
console.log(`🔒 보호됨: ${isProtected ? '예' : '아니오'}`);

// 1. 페이지 컴포넌트 생성
const pageTemplate = isProtected ?
  `import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ${pageNameCamel}: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Typography variant="h4">${pageNameCamel}</Typography>
      <Typography>안녕하세요, {user?.name}님!</Typography>
      {/* 페이지 내용을 여기에 작성하세요 */}
    </Box>
  );
};

export default ${pageNameCamel};
` :
  `import React from 'react';
import { Box, Typography } from '@mui/material';

const ${pageNameCamel}: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">${pageNameCamel}</Typography>
      {/* 페이지 내용을 여기에 작성하세요 */}
    </Box>
  );
};

export default ${pageNameCamel};
`;

const pagePath = `src/pages/${pageNameCamel}.tsx`;
fs.writeFileSync(pagePath, pageTemplate);
console.log(`✅ ${pagePath} 생성 완료`);

// 2. App.tsx에 라우트 추가
const appPath = 'src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// import 추가
const importLine = `import ${pageNameCamel} from './pages/${pageNameCamel}';`;
if (!appContent.includes(importLine)) {
  const lastImportIndex = appContent.lastIndexOf('import');
  const nextLineIndex = appContent.indexOf('\n', lastImportIndex) + 1;
  appContent = appContent.slice(0, nextLineIndex) + importLine + '\n' + appContent.slice(nextLineIndex);
}

// 라우트 추가
const routeTemplate = isProtected ?
  `          <Route path="${routePath}" element={
            <ProtectedRoute>
              <${pageNameCamel} />
            </ProtectedRoute>
          } />` :
  `          <Route path="${routePath}" element={<${pageNameCamel} />} />`;

if (!appContent.includes(`path="${routePath}"`)) {
  const routesEndIndex = appContent.lastIndexOf('        </Routes>');
  appContent = appContent.slice(0, routesEndIndex) + routeTemplate + '\n' + appContent.slice(routesEndIndex);
}

fs.writeFileSync(appPath, appContent);
console.log(`✅ App.tsx에 라우트 추가 완료`);

// 3. 보호된 페이지인 경우 보안 경로 추가
if (isProtected) {
  // AuthGuard.tsx 수정
  const authGuardPath = 'src/components/AuthGuard.tsx';
  let authGuardContent = fs.readFileSync(authGuardPath, 'utf8');

  const protectedPathsRegex = /const protectedPaths = \[([\s\S]*?)\];/;
  const match = authGuardContent.match(protectedPathsRegex);

  if (match) {
    const paths = match[1].split('\n').map(line => line.trim()).filter(line => line && line !== ']');
    if (!paths.includes(`'${routePath}'`)) {
      paths.push(`'${routePath}'`);
      const newPaths = paths.join(',\n  ');
      authGuardContent = authGuardContent.replace(protectedPathsRegex, `const protectedPaths = [\n  ${newPaths}\n];`);
      fs.writeFileSync(authGuardPath, authGuardContent);
      console.log(`✅ AuthGuard.tsx에 보안 경로 추가 완료`);
    }
  }

  // authUtils.ts 수정
  const authUtilsPath = 'src/utils/authUtils.ts';
  let authUtilsContent = fs.readFileSync(authUtilsPath, 'utf8');

  const authUtilsPathsRegex = /const protectedPaths = \[([\s\S]*?)\];/;
  const authUtilsMatch = authUtilsContent.match(authUtilsPathsRegex);

  if (authUtilsMatch) {
    const paths = authUtilsMatch[1].split('\n').map(line => line.trim()).filter(line => line && line !== ']');
    if (!paths.includes(`'${routePath}'`)) {
      paths.push(`'${routePath}'`);
      const newPaths = paths.join(',\n    ');
      authUtilsContent = authUtilsContent.replace(authUtilsPathsRegex, `const protectedPaths = [\n    ${newPaths}\n  ];`);
      fs.writeFileSync(authUtilsPath, authUtilsContent);
      console.log(`✅ authUtils.ts에 보안 경로 추가 완료`);
    }
  }
}

console.log('\n🎉 페이지 생성 완료!');
console.log(`\n📝 다음 단계:`);
console.log(`1. 개발 서버 재시작: npm run dev`);
console.log(`2. 브라우저에서 ${routePath} 접속하여 확인`);
if (isProtected) {
  console.log(`3. 로그인하지 않은 상태에서 ${routePath} 접속 시 로그인 페이지로 리다이렉트되는지 확인`);
}
console.log(`\n📁 생성된 파일: ${pagePath}`);
console.log(`🔗 접속 URL: http://localhost:5173${routePath}`); 