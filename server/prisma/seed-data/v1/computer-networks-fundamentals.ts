import type { SeedCourse } from '../types';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_01 } from './computer-networks-fundamentals-chapter-01';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_02 } from './computer-networks-fundamentals-chapter-02';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_03 } from './computer-networks-fundamentals-chapter-03';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_04 } from './computer-networks-fundamentals-chapter-04';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_05 } from './computer-networks-fundamentals-chapter-05';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_06 } from './computer-networks-fundamentals-chapter-06';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_07 } from './computer-networks-fundamentals-chapter-07';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_08 } from './computer-networks-fundamentals-chapter-08';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_09 } from './computer-networks-fundamentals-chapter-09';
import { COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_10 } from './computer-networks-fundamentals-chapter-10';

export const COMPUTER_NETWORKS_FUNDAMENTALS_COURSE: SeedCourse = {
  version: 'v1',
  key: 'computer-networks-fundamentals',
  slug: 'computer-networks-fundamentals',
  title: '计算机网络基础',
  summary: '从分层模型、链路、IP、路由、TCP、应用协议和安全出发，建立完整的网络通信分析能力。',
  description: '课程覆盖网络分层、物理介质、以太网、IPv4 与子网、路由、UDP/TCP、拥塞控制、DNS、HTTP、TLS、安全和故障诊断。',
  category: 'NETWORK',
  language: 'Python',
  difficulty: 'INTERMEDIATE',
  estimatedMinutes: 1200,
  targetAudience: '希望系统掌握计算机网络原理、协议机制和工程诊断方法的学习者。',
  learningObjectives: [
    '理解网络边缘、核心、分层模型、封装和端到端通信路径',
    '能够分析链路、以太网、IPv4、子网、ARP、ICMP 和路由转发',
    '能够解释 UDP、TCP、确认重传、流量控制、拥塞控制和性能指标',
    '能够分析 DNS、HTTP、HTTPS、TLS、安全边界和常见网络故障',
  ],
  status: 'PUBLISHED',
  sortOrder: 700,
  battleSkillCode: 'PYTHON',
  chapters: [
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_01,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_02,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_03,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_04,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_05,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_06,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_07,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_08,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_09,
    COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_10,
  ],
};
