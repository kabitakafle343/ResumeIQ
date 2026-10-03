import axios from "axios";
import TokenService from "./tokenservice";
import HttpClient from "./interceptor";

const baseURL = `${import.meta.env.VITE_BACKEND_URL}/api`;

interface loginI {
  email: string;
  password: string;
}

interface signupI {
  name: string;
  email: string;
  password: string;
}

export interface ResumeHistoryItem {
  id: string;
  title: string;
  score: number;
  date: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ResumeHistoryData {
  totalAnalyses: number;
  latestScore?: number | null;
  firstScore?: number | null;
  highestScore?: number | null;
  averageScore?: number | null;
  scoreImprovement?: number | null;
  commonIssues: { issue: string; count: number }[];
  history: ResumeHistoryItem[];
}

export interface ResumeJobMatch {
  matchScore: number;
  summary: string;
  alignedQualifications: string[];
  gaps: { requirement: string; evidenceInResume: string; priority: string }[];
  recommendations: { action: string; reason: string }[];
}

export const userLogin = async (user: loginI) => {
  const res = await axios.post(
    `${baseURL}/auth/login`,
    { email: user.email, password: user.password },
    { withCredentials: true },
  );
  TokenService.setToken({ access: res.data.token });
  return res.data;
};

export const userLogout = async () => {
  await axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true });
};

export const userSignUp = async (user: signupI) => {
  const res = await axios.post(`${baseURL}/auth/signup`, {
    name: user.name,
    email: user.email,
    password: user.password,
  });
  console.log(res);
  return res.data;
};

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);

  const res = await HttpClient.post("/pdf/upload", formData);
  return res.data;
};

export const getResumeHistory = async () => {
  const res = await HttpClient.get<ResumeHistoryData>("/resume/history");
  return res.data;
};

export const deleteResumeHistory = async (id: string) => {
  const res = await HttpClient.delete(`/resume/history/${id}`);
  return res.data;
};

export const matchResumeToJob = async (id: string, jobDescription: string) => {
  const res = await HttpClient.post<ResumeJobMatch>(`/resume/${id}/match`, { jobDescription });
  return res.data;
};
