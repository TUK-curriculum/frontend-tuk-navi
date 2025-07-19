// src/components/UserDataExample.tsx
// 사용자별 데이터 관리 시스템 사용 예시

import React, { useState } from 'react';
import { useData } from '../contexts/SeparatedDataContext';
import { useAuth } from '../contexts/AuthContext';

const UserDataExample: React.FC = () => {
    const { user } = useAuth();
    const {
        // 기본 데이터
        profile,
        updateProfile,

        // 졸업 관리
        graduationInfo,
        updateGraduationInfo,

        // 커리큘럼 관리
        curriculum,
        updateCurriculum,

        // 시간표 관리
        schedule,
        updateSchedule,

        // 메모 관리
        notes,
        addNote,
        updateNote,
        deleteNote,

        // 채팅 메시지 관리
        messages,
        addMessage,
        clearMessages,

        // 온보딩 관리
        onboarding,
        updateOnboarding,

        // 설정 관리
        settings,
        updateSettings,

        // 새로운 기능들
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,

        recentSearches,
        addRecentSearch,
        clearRecentSearches,

        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,

        statistics,
        updateStatistics
    } = useData();

    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // 메모 추가 예시
    const handleAddNote = () => {
        if (newNoteTitle && newNoteContent) {
            addNote({
                title: newNoteTitle,
                content: newNoteContent,
                category: '일반'
            });
            setNewNoteTitle('');
            setNewNoteContent('');
        }
    };

    // 메시지 추가 예시
    const handleAddMessage = () => {
        if (newMessage) {
            addMessage({
                content: newMessage,
                sender: 'user'
            });
            setNewMessage('');
        }
    };

    // 검색어 추가 예시
    const handleAddSearch = () => {
        if (searchTerm) {
            addRecentSearch(searchTerm);
            setSearchTerm('');
        }
    };

    // 알림 추가 예시
    const handleAddNotification = () => {
        addNotification({
            title: '새 알림',
            message: '새로운 알림이 도착했습니다.',
            type: 'info',
            isRead: false
        });
    };

    // 즐겨찾기 토글 예시
    const handleToggleFavorite = (courseId: string) => {
        if (isFavorite(courseId)) {
            removeFromFavorites(courseId);
        } else {
            addToFavorites(courseId);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">사용자별 데이터 관리 시스템 예시</h1>

            {/* 현재 사용자 정보 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">현재 사용자</h2>
                <p>이메일: {user?.email}</p>
                <p>이름: {user?.name}</p>
            </div>

            {/* 프로필 관리 */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">프로필 관리</h2>
                <p>이름: {profile.name}</p>
                <p>학번: {profile.studentId}</p>
                <p>전공: {profile.major}</p>
                <button
                    onClick={() => updateProfile({ name: '새로운 이름' })}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    이름 변경
                </button>
            </div>

            {/* 메모 관리 */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">메모 관리 ({notes.length}개)</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="메모 제목"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="mr-2 px-3 py-1 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="메모 내용"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="mr-2 px-3 py-1 border rounded"
                    />
                    <button
                        onClick={handleAddNote}
                        className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        메모 추가
                    </button>
                </div>
                <div className="space-y-2">
                    {notes.map(note => (
                        <div key={note.id} className="p-2 bg-white rounded border">
                            <h3 className="font-semibold">{note.title}</h3>
                            <p>{note.content}</p>
                            <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-500 text-sm"
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 채팅 메시지 관리 */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">채팅 메시지 ({messages.length}개)</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="메시지 입력"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="mr-2 px-3 py-1 border rounded"
                    />
                    <button
                        onClick={handleAddMessage}
                        className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        메시지 전송
                    </button>
                    <button
                        onClick={clearMessages}
                        className="ml-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        메시지 초기화
                    </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {messages.map(message => (
                        <div key={message.id} className="p-2 bg-white rounded border">
                            <span className="text-sm text-gray-500">{message.sender}: </span>
                            <span>{message.content}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 즐겨찾기 관리 */}
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">즐겨찾기 ({favorites.length}개)</h2>
                <div className="space-y-2">
                    {favorites.map(courseId => (
                        <div key={courseId} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span>과목 ID: {courseId}</span>
                            <button
                                onClick={() => removeFromFavorites(courseId)}
                                className="text-red-500"
                            >
                                제거
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => handleToggleFavorite('sample-course-1')}
                    className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    샘플 과목 즐겨찾기 토글
                </button>
            </div>

            {/* 최근 검색어 관리 */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">최근 검색어 ({recentSearches.length}개)</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="검색어 입력"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mr-2 px-3 py-1 border rounded"
                    />
                    <button
                        onClick={handleAddSearch}
                        className="px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        검색어 추가
                    </button>
                    <button
                        onClick={clearRecentSearches}
                        className="ml-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        검색어 초기화
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                        <span key={index} className="px-2 py-1 bg-white rounded border text-sm">
                            {search}
                        </span>
                    ))}
                </div>
            </div>

            {/* 알림 관리 */}
            <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">알림 ({notifications.length}개)</h2>
                <button
                    onClick={handleAddNotification}
                    className="mb-4 px-4 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                    알림 추가
                </button>
                <div className="space-y-2">
                    {notifications.map(notification => (
                        <div key={notification.id} className={`p-2 rounded border ${notification.isRead ? 'bg-gray-100' : 'bg-white'}`}>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p>{notification.message}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-500">{notification.type}</span>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markNotificationAsRead(notification.id)}
                                        className="text-blue-500 text-sm"
                                    >
                                        읽음 표시
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={clearNotifications}
                    className="mt-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    모든 알림 삭제
                </button>
            </div>

            {/* 통계 정보 */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">사용자 통계</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p>총 로그인 횟수: {statistics.totalLoginCount}</p>
                        <p>마지막 로그인: {new Date(statistics.lastLoginDate).toLocaleString()}</p>
                        <p>총 공부 시간: {statistics.totalStudyTime}분</p>
                    </div>
                    <div>
                        <p>완료한 과목: {statistics.completedCoursesCount}개</p>
                        <p>메모 개수: {statistics.notesCount}개</p>
                        <p>메시지 개수: {statistics.messagesCount}개</p>
                        <p>즐겨찾기 과목: {statistics.favoriteCoursesCount}개</p>
                    </div>
                </div>
            </div>

            {/* 설정 관리 */}
            <div className="mb-6 p-4 bg-teal-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">설정</h2>
                <p>테마: {settings.theme}</p>
                <p>언어: {settings.language}</p>
                <p>알림: {settings.notifications ? '켜짐' : '꺼짐'}</p>
                <button
                    onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                    className="px-4 py-1 bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                    테마 변경
                </button>
            </div>
        </div>
    );
};

export default UserDataExample; 