362
 useEffect(() => {
363
 if (open && user?.email) {
364
 // 초기화하지 않고 에러만 클리어
365
 setErrors({});
366
 }
367
 }, [open, user?.email]);
368​
369
 useEffect(() => {
370
 if (userData?.onboarding) {
371
 setInfo({ ...getInitialInfo(), ...userData.onboarding });
372
 }
373
 }, [userData?.onboarding]);
374​
375
 // 회원가입 시 입력한 기본 정보 자동 설정 (백엔드에서 조회)
376
 useEffect(() => {
377
 const loadUserProfile = async () => {
378
 if (isProfileLoaded) return;
379​
380
 try {
381
 // 백엔드에서 실제 프로필 정보 조회
382
 const { apiService } = await import('../services/ApiService');
383
 const profile = await apiService.getProfile();
384​
385
 // profile이 없을 수 있으므로 명시적으로 처리
386
 if (!profile) {
387
 const fallbackData = {
388
 name: user?.name || '',
389
 email: user?.email || '',
390
 studentId: (user?.profile as any)?.studentId || '',
391
 department: normalizeDepartment((user?.profile as any)?.major || ''),
392
 year: (user?.profile as any)?.grade ? `${(user?.profile as any).grade}학년` : ''
393
 };
394​
395
 setInfo(prev => ({
396
 ...prev,
397
 ...fallbackData
398
 }));
399
 setIsProfileLoaded(true);
400
 return;
401
 }
402​
403
 console.log('[InterestSelection] Profile loaded from backend:', profile);
404
 console.log('[InterestSelection] Current user data:', user);
405
 console.log('[InterestSelection] User profile details:', user?.profile);
406​
407
 // Register.tsx에서 사용하는 grade 값은 "4학년" 형태이므로 숫자를 문자열로 변환
408
 const gradeText = profile?.grade ? `${profile.grade}학년` : '';
409​
410
 const mappedData = {
411
 name: profile.name || user?.name || '',
412
 email: profile.email || user?.email || '',
413
 studentId: profile.studentId || (user?.profile as any)?.studentId || '',
414
 department: normalizeDepartment(profile.major || (user?.profile as any)?.major || ''),
415
 year: gradeText || ((user?.profile as any)?.grade ? `${(user?.profile as any).grade}학년` : ''),
416
 };
417​
418
 console.log('[InterestSelection] Backend profile studentId:', profile.studentId);
419
 console.log('[InterestSelection] Backend profile grade:', profile.grade);
420
 console.log('[InterestSelection] User profile studentId:', (user?.profile as any)?.studentId);
421
 console.log('[InterestSelection] User profile grade:', (user?.profile as any)?.grade);
422
 console.log('[InterestSelection] Mapped data:', mappedData);
423​
424
 setInfo(prev => ({ 
425
 ...prev, 
426
 ...mappedData
427
 }));
428
 setIsProfileLoaded(true);
429
 } catch (error) {
430
 console.error('프로필 로드 실패:', error);
431
 setIsProfileLoaded(true);
432
 }
433
 };
434
 loadUserProfile();
435
 }, [user?.email, user?.profile, isProfileLoaded, user?.name]);