import React from 'react';
import UserDataExample from '../components/UserDataExample';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            사용자별 데이터 관리 시스템 테스트
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            이 페이지에서는 새로운 사용자별 데이터 관리 시스템의 모든 기능을 테스트할 수 있습니다.
            다른 계정으로 로그인하여 데이터가 완전히 분리되는 것을 확인해보세요.
          </p>
        </div>

        <UserDataExample />

        <div className="mt-12 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">테스트 가이드</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">1. 계정 전환 테스트</h3>
              <p className="text-gray-600 text-sm">
                - 다른 계정으로 로그인하여 데이터가 완전히 분리되는지 확인
                - 메모, 즐겨찾기, 검색어 등이 계정별로 독립적으로 관리되는지 확인
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800">2. 데이터 지속성 테스트</h3>
              <p className="text-gray-600 text-sm">
                - 페이지를 새로고침한 후 데이터가 유지되는지 확인
                - 브라우저를 닫았다가 다시 열어도 데이터가 보존되는지 확인
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800">3. 기능별 테스트</h3>
              <p className="text-gray-600 text-sm">
                - 메모 추가/삭제 기능 테스트
                - 즐겨찾기 토글 기능 테스트
                - 검색어 추가/초기화 기능 테스트
                - 알림 추가/읽음 표시 기능 테스트
                - 통계 업데이트 확인
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800">4. localStorage 확인</h3>
              <p className="text-gray-600 text-sm">
                - 브라우저 개발자 도구 → Application → Local Storage에서
                - user_${email} 형태의 키로 데이터가 저장되는지 확인
                - 각 사용자별로 완전히 분리된 데이터 구조 확인
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">시스템 특징</h2>
          <ul className="space-y-2 text-blue-700">
            <li>✅ 모든 사용자 데이터가 완전히 분리</li>
            <li>✅ 계정별 1:1 데이터 관리</li>
            <li>✅ 로그인/계정 전환 시 해당 계정 데이터만 접근</li>
            <li>✅ localStorage에 user_${email} 형태로 저장</li>
            <li>✅ 새로운 기능 추가 시 간단한 확장 가능</li>
            <li>✅ 자동 통계 업데이트</li>
            <li>✅ 기존 데이터 자동 마이그레이션</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
