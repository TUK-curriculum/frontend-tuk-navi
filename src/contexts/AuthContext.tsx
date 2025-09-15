85
​
86            } catch (profileError) {
87 console.error('[AuthContext] Failed to fetch profile from backend:', profileError);
88​
89 // 백엔드 조회 실패 시 로그인 응답에서 받은 정보로 fallback
90 if (userInfo && typeof window !== 'undefined') {
91 const fallbackProfileData = {
92 userId: userInfo.userId || '',
93 name: userInfo.name || userInfo.nickname || userInfo.username || '',
94 email: email,
95 studentId: userInfo.studentId || '',
96 major: userInfo.major || '',
97 grade: userInfo.grade || 1,
98 semester: userInfo.semester || 1,
99 phone: userInfo.phone || '',
100 nickname: userInfo.nickname || userInfo.name || '',
101 interests: userInfo.interests || [],
102 avatar: userInfo.avatar || '',
103 enrollmentYear: userInfo.enrollmentYear ?? null,
104 graduationYear: userInfo.graduationYear ?? null,
105                    };
106​
107 console.log('[AuthContext] Using fallback profile data:', fallbackProfileData);
108​
109 window.dispatchEvent(new CustomEvent('updateUserProfile', {
110 detail: fallbackProfileData
111                    }));
112                }
113            }
114​
115 console.log(`사용자 ${email}의 데이터 초기화 완료`);
116        } catch (error) {
117 console.error('사용자 데이터 초기화 실패:', error);
118        }
119    };
120​
121 // 사용자별 데이터 정리
122 const clearUserData = () => {
123 try {
124 // 현재 사용자의 데이터만 정리 (다른 사용자 데이터는 보존)
125 if (user?.email) {
126 console.log(`사용자 ${user.email}의 데이터 정리 완료`);
127            }
128        } catch (error) {
129 console.error('사용자 데이터 정리 실패:', error);
130        }
131    };
132​
133 useEffect(() => {
134 const initializeAuth = async () => {
135 try {
136 // 토큰 확인으로 로그인 상태 판단
137 const accessToken = localStorage.getItem('accessToken');
138 const userEmail = localStorage.getItem('userEmail');
139​
140 if (accessToken && userEmail) {
141 try {
142 const { userRepository } = await import('../repositories/UserRepository');
143 const profileData = await userRepository.getProfile();
144​
145 const userWithProfile = {
146 id: profileData?.userId || userEmail,
147 userId: profileData?.userId || userEmail,
148 name: profileData?.name || profileData?.email || userEmail,
149 email: profileData?.email || userEmail,
150 profile: profileData as any
151 };
152 setUser(userWithProfile);