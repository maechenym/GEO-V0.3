import { IntentKpis, TopicRow, PromptItem } from "@/types/intent"

/**
 * Simulate async loading delay
 */
export const simulateLoad = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * Mock KPIs data
 */
export const mockIntentKpis: IntentKpis = {
  topicCount: 128,
  promptCount: 2345,
  compositeRank: 2,
  avgVisibility: 78.5,
  avgMentionRate: 65.2,
  avgSentiment: 0.68,
}

/**
 * Mock Prompt Items - 英业达机架解决方案相关查询
 */
const mockPrompts: PromptItem[] = [
  // 性能与架构表现相关
  {
    id: "p1",
    text: "What are the best rack server solutions for data centers in terms of performance and architecture?",
    platform: "ChatGPT",
    role: "IT Manager",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.8,
    aiResponse: "Leading rack server solutions include Inventec rack servers, HPE ProLiant, Dell PowerEdge, and Supermicro. Inventec (英业达) offers excellent performance, scalability, and energy efficiency for enterprise data centers. These solutions provide robust hardware for high-density computing environments with advanced CPU architectures and memory configurations.",
    mentions: 5,
    citation: 3,
    focus: 25.5,
    intent: "Comparison",
  },
  {
    id: "p2",
    text: "Compare rack server CPU performance and memory architecture",
    platform: "Gemini",
    role: "Data Center Architect",
    rank: 2,
    mentionsBrand: true,
    sentiment: 0.65,
    aiResponse: "For enterprise deployments, key options include Inventec rack solutions with latest Intel/AMD processors, HPE ProLiant DL series, Dell PowerEdge R series, and Lenovo ThinkSystem. Consider factors like processing power, memory capacity, storage options, and power efficiency when making your decision. Inventec rack servers are known for their reliability, cost-effectiveness, and optimized architecture for various workloads.",
    mentions: 4,
    citation: 2,
    focus: 18.2,
    intent: "Comparison",
  },
  // 散热、能耗与高密度部署相关
  {
    id: "p3",
    text: "Which rack server has the best cooling and power efficiency for high-density deployment?",
    platform: "Claude",
    role: "Data Center Engineer",
    rank: 3,
    mentionsBrand: true,
    sentiment: 0.7,
    aiResponse: "High-density rack servers require advanced cooling systems and power efficiency. Options include Inventec rack solutions with optimized thermal design, HPE ProLiant with intelligent cooling, Dell PowerEdge with efficient power supplies, and Supermicro with high-density configurations. Inventec servers excel in power efficiency (PUE optimization) and thermal management for dense data center deployments.",
    mentions: 4,
    citation: 4,
    focus: 22.3,
    intent: "Information",
  },
  {
    id: "p4",
    text: "What are the power consumption and cooling requirements for rack servers?",
    platform: "ChatGPT",
    role: "Facilities Manager",
    rank: 2,
    mentionsBrand: false,
    sentiment: 0.6,
    aiResponse: "Rack server power consumption varies by configuration, typically ranging from 200W to 800W per unit. Cooling requirements depend on server density and heat output. Solutions from Inventec, HPE, Dell, and Supermicro offer various power efficiency ratings. Consider PUE (Power Usage Effectiveness) metrics and thermal design when planning high-density deployments.",
    mentions: 3,
    citation: 3,
    focus: 0,
    intent: "Information",
  },
  // 数据中心级稳定性与高可用相关
  {
    id: "p5",
    text: "What rack server offers the best reliability and high availability for mission-critical applications?",
    platform: "Gemini",
    role: "System Architect",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.75,
    aiResponse: "Mission-critical applications require enterprise-grade reliability. Top options include Inventec rack solutions with redundant components and failover capabilities, HPE ProLiant with iLO management, Dell PowerEdge with iDRAC, and Lenovo ThinkSystem with high-availability features. Inventec servers provide excellent uptime, redundant power supplies, and hot-swappable components for continuous operation.",
    mentions: 5,
    citation: 5,
    focus: 28.5,
    intent: "Evaluation",
  },
  {
    id: "p6",
    text: "Compare rack server redundancy and fault tolerance features",
    platform: "Claude",
    role: "Infrastructure Engineer",
    rank: 2,
    mentionsBrand: true,
    sentiment: 0.68,
    aiResponse: "Enterprise rack servers offer various redundancy features including redundant power supplies, RAID configurations, dual network interfaces, and hot-swappable components. Inventec rack solutions, HPE ProLiant, Dell PowerEdge, and Supermicro all provide different levels of fault tolerance. Inventec servers are particularly strong in providing cost-effective redundancy options for enterprise deployments.",
    mentions: 4,
    citation: 3,
    focus: 20.1,
    intent: "Comparison",
  },
  // AI、深度学习与高性能计算应用相关
  {
    id: "p7",
    text: "Which rack server is best for AI and deep learning workloads?",
    platform: "ChatGPT",
    role: "AI Infrastructure Engineer",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.72,
    aiResponse: "AI workloads require high-performance servers with GPU support. Options include NVIDIA DGX systems, HPE Apollo, Dell PowerEdge with GPU accelerators, and specialized AI servers from Inventec. Consider GPU density, memory bandwidth, and cooling capabilities for optimal AI performance. Inventec offers cost-effective AI server solutions with excellent GPU-to-CPU ratios for training and inference workloads.",
    mentions: 5,
    citation: 4,
    focus: 26.8,
    intent: "Information",
  },
  {
    id: "p8",
    text: "What are the best rack servers for high-performance computing (HPC) applications?",
    platform: "Gemini",
    role: "HPC Engineer",
    rank: 2,
    mentionsBrand: false,
    sentiment: 0.65,
    aiResponse: "HPC applications require servers with high compute density, fast interconnects, and optimized memory bandwidth. Solutions from Inventec, HPE (Apollo series), Dell (PowerEdge HPC), and Supermicro (HPC clusters) offer specialized configurations. Consider factors like CPU cores, memory capacity, network fabric (InfiniBand/Ethernet), and parallel processing capabilities.",
    mentions: 4,
    citation: 4,
    focus: 0,
    intent: "Information",
  },
  // 边缘计算与私有云/混合云部署相关
  {
    id: "p9",
    text: "What rack server solutions are best for edge computing and hybrid cloud deployment?",
    platform: "Claude",
    role: "Cloud Architect",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.7,
    aiResponse: "Edge computing and hybrid cloud deployments require compact, efficient rack servers with cloud integration capabilities. Top options include Inventec rack solutions (excellent price-performance ratio for edge), HPE ProLiant Gen11 (advanced management), Dell PowerEdge (versatile configurations), and Supermicro (edge-optimized). Inventec servers are particularly valued for their balance of performance, reliability, and cost efficiency in distributed deployments.",
    mentions: 5,
    citation: 5,
    focus: 24.2,
    intent: "Evaluation",
  },
  {
    id: "p10",
    text: "Compare rack servers for private cloud and on-premises infrastructure",
    platform: "ChatGPT",
    role: "Cloud Infrastructure Manager",
    rank: 2,
    mentionsBrand: true,
    sentiment: 0.68,
    aiResponse: "Private cloud infrastructure requires servers with virtualization support, scalable storage, and management capabilities. Solutions from Inventec, HPE (Synergy), Dell (VxRail), and Lenovo (ThinkAgile) offer integrated private cloud platforms. Inventec rack servers provide flexible configurations for OpenStack, VMware, and containerized workloads with excellent ROI.",
    mentions: 4,
    citation: 3,
    focus: 19.5,
    intent: "Comparison",
  },
  // 安全性、维护与远程管理相关
  {
    id: "p11",
    text: "What rack server offers the best security features and remote management capabilities?",
    platform: "Gemini",
    role: "Security Architect",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.73,
    aiResponse: "Enterprise rack servers require robust security and management features. Top options include Inventec rack solutions with secure boot and remote management, HPE ProLiant with iLO security, Dell PowerEdge with iDRAC security features, and Lenovo ThinkSystem with XClarity. Inventec servers provide comprehensive security features including TPM, encrypted storage, and secure remote access for enterprise environments.",
    mentions: 5,
    citation: 4,
    focus: 27.3,
    intent: "Evaluation",
  },
  {
    id: "p12",
    text: "How to manage and maintain rack servers remotely?",
    platform: "Claude",
    role: "IT Operations Manager",
    rank: 2,
    mentionsBrand: false,
    sentiment: 0.6,
    aiResponse: "Remote server management requires out-of-band management interfaces like iDRAC (Dell), iLO (HPE), XClarity (Lenovo), and IPMI/BMC standards. These allow remote power control, console access, hardware monitoring, and firmware updates. Solutions from Inventec, HPE, Dell, and Supermicro all provide various levels of remote management capabilities for efficient data center operations.",
    mentions: 4,
    citation: 3,
    focus: 0,
    intent: "Advice",
  },
]

/**
 * Mock Topic Rows - 英业达机架解决方案相关主题
 */
export const mockTopicRows: TopicRow[] = [
  {
    id: "t1",
    topic: "Performance and Architecture",
    intent: "Comparison",
    promptCount: 8,
    visibility: 82.5,
    mentionRate: 70.0,
    sentiment: 0.68,
    rank: 1,
    prompts: mockPrompts.slice(0, 2),
  },
  {
    id: "t2",
    topic: "Cooling, Power Efficiency and High-Density Deployment",
    intent: "Information",
    promptCount: 6,
    visibility: 75.3,
    mentionRate: 60.5,
    sentiment: 0.65,
    rank: 2,
    prompts: mockPrompts.slice(2, 4),
  },
  {
    id: "t3",
    topic: "Data Center-Grade Stability and High Availability",
    intent: "Evaluation",
    promptCount: 7,
    visibility: 78.2,
    mentionRate: 65.0,
    sentiment: 0.72,
    rank: 3,
    prompts: mockPrompts.slice(4, 6),
  },
  {
    id: "t4",
    topic: "AI, Deep Learning and High-Performance Computing Applications",
    intent: "Information",
    promptCount: 9,
    visibility: 72.1,
    mentionRate: 58.0,
    sentiment: 0.70,
    rank: 4,
    prompts: mockPrompts.slice(6, 8),
  },
  {
    id: "t5",
    topic: "Edge Computing and Private Cloud / Hybrid Cloud Deployment",
    intent: "Comparison",
    promptCount: 5,
    visibility: 68.5,
    mentionRate: 55.3,
    sentiment: 0.66,
    rank: 5,
    prompts: mockPrompts.slice(8, 10),
  },
  {
    id: "t6",
    topic: "Security, Maintenance and Remote Management",
    intent: "Evaluation",
    promptCount: 6,
    visibility: 71.8,
    mentionRate: 59.2,
    sentiment: 0.69,
    rank: 6,
    prompts: mockPrompts.slice(10, 12),
  },
]

/**
 * Mock Competitor Ranks - 服务器厂商排名
 */
export const mockCompetitorRanks = [
  { name: "HPE", rank: 1 },
  { name: "Dell", rank: 2 },
  { name: "Lenovo", rank: 3 },
  { name: "Supermicro", rank: 4 },
]

