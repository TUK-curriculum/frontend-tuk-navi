1
import { BaseRepository, PaginatedResponse, QueryOptions } from './BaseRepository';
2
import apiClient from '../config/apiClient';
3
import { UserData, UserProfile, UserSettings } from '../types/user';
4​
5
export interface UserProfileUpdate {
6
 username?: string;
7
 phone?: string;
8
 major?: string;
9
}
10​
11
export interface UserProfileResponse {
12
 success: boolean;
13
 message: string;
14
 data: UserProfile;
15
}
16​
17
export interface UserUpdateDTO {
18
 name?: string;
19
 email?: string;
20
 password?: string;
21
 studentId?: number;
22
 major?: string;
23
 grade?: number;
24
 semester?: number;
25
 phone?: string;
26
 nickname?: string;
27
 interests?: string[];
28
 avatar?: string;
29
}
30​
31
export interface UserCreateDTO {
32
 name: string;
33
 email: string;
34
 password: string;
35
 studentId: number;
36
 major?: string;
37
 grade?: number;
38
 semester?: number;
39
 phone?: string;
40
 nickname?: string;
41
 interests?: string[];
42
 avatar?: string;
43
}
44​
45​
46
class UserRepository extends BaseRepository<UserProfile> {
47
 protected endpoint = '/users';
48​
49
 private static instance: UserRepository;
50​
51
 public static getInstance(): UserRepository {
52
 if (!UserRepository.instance) {
53
 UserRepository.instance = new UserRepository();
54
 }
55
 return UserRepository.instance;
56
 }
57​
58
 async findAll(options?: QueryOptions): Promise<UserProfile[]> {
59
 const queryString = this.buildQueryString(options);
60
 const response = await apiClient.get<PaginatedResponse<UserProfile>>(`${this.endpoint}${queryString}`);
61
 return response.data.data;
62
 }
63​
64
 async findById(id: number): Promise<UserProfile | null> {
65
 try {
66
 const response = await apiClient.get<UserProfileResponse>('/profile');
67
 console.log('[UserRepository] Profile fetched successfully:', response.data);
68
 return response.data.data; // unwrap ApiResponse
69
 } catch (error) {
70
 console.error('[UserRepository] Failed to fetch profile:', error);
71
 throw error;
72
 }
73
 }
74​
75
 async create(data: UserCreateDTO): Promise<UserProfile> {
76
 const response = await apiClient.post<UserProfileResponse>(this.endpoint, data);
77
 return response.data.data;
78
 }
79​
80
 async update(id: number, data: UserUpdateDTO): Promise<UserProfile> {
81
 const response = await apiClient.put<UserProfileResponse>(`${this.endpoint}/${id}`, data);
82
 return response.data.data;
83
 }
84​
85
 async delete(id: number): Promise<boolean> {
86
 await apiClient.delete(`${this.endpoint}/${id}`);
87
 return true;
88
 }
89​
90
 async getProfile(): Promise<UserProfile | null> {
91
 try {
92
 const response = await apiClient.get<UserProfileResponse>('/profile');
93
 console.log('[UserRepository] Profile fetched successfully:', response.data);
94
 return response.data.data; // unwrap ApiResponse
95
 } catch (error) {
96
 console.error('[UserRepository] Failed to fetch profile:', error);
97
 throw error;
98
 }
99
 }
100​
101
 async updateProfile(data: UserUpdateDTO): Promise<UserProfile> {
102
 const response = await apiClient.put<UserProfileResponse>('/profile', data);
103
 return response.data.data;
104
 }
105​
106
 async updateSettings(settings: UserSettings): Promise<UserSettings> {
107
 const response = await apiClient.put('/profile/settings', settings);
108
 return response.data.data;
109
 }
110​
111
 async getSettings(): Promise<UserSettings> {
112
 const response = await apiClient.get('/profile/settings');
113
 return response.data.data;
114
 }
115
}
116​
117
export const userRepository = UserRepository.getInstance();
118
export default userRepository;
119​
120
export { UserRepository };