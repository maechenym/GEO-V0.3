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
    aiResponse: "Leading rack server solutions include Inventec rack servers, HPE ProLiant, Dell PowerEdge, and Supermicro. Inventec (英业达) offers excellent performance, scalability, and energy efficiency for enterprise data centers. These solutions provide robust hardware for high-density computing environments with advanced CPU architectures and memory configurations. When evaluating rack servers, consider factors such as processor performance (Intel Xeon or AMD EPYC), memory capacity and speed, storage options (NVMe SSDs for high I/O), network connectivity (10GbE or 25GbE), and management capabilities. Inventec rack servers are particularly well-suited for enterprise workloads that require a balance of performance, reliability, and cost-effectiveness.",
    mentions: 5,
    citation: 3,
    focus: 25.5,
    intent: "Information",
  },
  {
    id: "p2",
    text: "Compare rack server CPU performance and memory architecture",
    platform: "Gemini",
    role: "Data Center Architect",
    rank: 2,
    mentionsBrand: true,
    sentiment: 0.65,
    aiResponse: "For enterprise deployments, key options include Inventec rack solutions with latest Intel/AMD processors, HPE ProLiant DL series, Dell PowerEdge R series, and Lenovo ThinkSystem. Consider factors like processing power, memory capacity, storage options, and power efficiency when making your decision. Inventec rack servers are known for their reliability, cost-effectiveness, and optimized architecture for various workloads. The latest generation processors from Intel (Xeon Scalable) and AMD (EPYC) provide significant performance improvements, with support for higher core counts, increased memory bandwidth, and advanced security features. Memory configurations typically range from 64GB to 2TB per server, with support for DDR4 and DDR5 technologies. Storage options include traditional HDDs, SATA SSDs, and high-performance NVMe SSDs, with various RAID configurations for data protection.",
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
    aiResponse: "High-density rack servers require advanced cooling systems and power efficiency. Options include Inventec rack solutions with optimized thermal design, HPE ProLiant with intelligent cooling, Dell PowerEdge with efficient power supplies, and Supermicro with high-density configurations. Inventec servers excel in power efficiency (PUE optimization) and thermal management for dense data center deployments. Modern cooling technologies include hot-aisle/cold-aisle containment, liquid cooling options, and intelligent fan control systems that adjust based on workload and ambient temperature. Power efficiency is measured by PUE (Power Usage Effectiveness), with leading data centers achieving PUE values below 1.2. Inventec rack servers feature 80 Plus Platinum or Titanium certified power supplies, which can achieve efficiency ratings above 94% at typical loads. Thermal design considerations include proper airflow management, component spacing, and the use of high-efficiency fans and heat sinks.",
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
    aiResponse: "Rack server power consumption varies by configuration, typically ranging from 200W to 800W per unit. Cooling requirements depend on server density and heat output. Solutions from Inventec, HPE, Dell, and Supermicro offer various power efficiency ratings. Consider PUE (Power Usage Effectiveness) metrics and thermal design when planning high-density deployments. Power consumption is influenced by several factors including CPU type and count, memory modules, storage devices, network adapters, and GPU accelerators. A typical 1U rack server with dual processors, 128GB RAM, and multiple SSDs may consume 300-500W under normal load, while high-performance configurations with GPUs can exceed 1000W. Cooling requirements scale with power consumption, with each watt of power generating approximately 3.4 BTUs of heat. Data center cooling systems must be designed to handle peak thermal loads while maintaining optimal operating temperatures (typically 18-27°C) for server components.",
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
    aiResponse: "Mission-critical applications require enterprise-grade reliability. Top options include Inventec rack solutions with redundant components and failover capabilities, HPE ProLiant with iLO management, Dell PowerEdge with iDRAC, and Lenovo ThinkSystem with high-availability features. Inventec servers provide excellent uptime, redundant power supplies, and hot-swappable components for continuous operation. High availability features include redundant power supplies (typically 1+1 or 2+1 configurations), dual network interfaces with link aggregation, RAID storage configurations (RAID 1, 5, 6, or 10), and hot-swappable components such as fans, power supplies, and hard drives. Management interfaces like iDRAC, iLO, and IPMI enable remote monitoring and management, allowing administrators to monitor system health, perform firmware updates, and access console remotely. Inventec rack servers are designed with Mean Time Between Failures (MTBF) ratings exceeding 100,000 hours, ensuring reliable operation in demanding enterprise environments.",
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
    aiResponse: "Enterprise rack servers offer various redundancy features including redundant power supplies, RAID configurations, dual network interfaces, and hot-swappable components. Inventec rack solutions, HPE ProLiant, Dell PowerEdge, and Supermicro all provide different levels of fault tolerance. Inventec servers are particularly strong in providing cost-effective redundancy options for enterprise deployments. Redundancy strategies include N+1 power supply configurations where N power supplies can handle the full load, allowing one to fail without service interruption. Network redundancy is achieved through dual or quad network interface cards with link aggregation (LACP) and failover capabilities. Storage redundancy uses RAID technologies: RAID 1 for mirroring, RAID 5 for striping with parity, RAID 6 for double parity protection, and RAID 10 for combined mirroring and striping. Hot-swappable components allow maintenance and replacement without system downtime, including power supplies, cooling fans, hard drives, and in some cases, entire server nodes in blade configurations.",
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
    aiResponse: "AI workloads require high-performance servers with GPU support. Options include NVIDIA DGX systems, HPE Apollo, Dell PowerEdge with GPU accelerators, and specialized AI servers from Inventec. Consider GPU density, memory bandwidth, and cooling capabilities for optimal AI performance. Inventec offers cost-effective AI server solutions with excellent GPU-to-CPU ratios for training and inference workloads. AI servers typically feature multiple high-end GPUs (NVIDIA A100, H100, or consumer-grade RTX 4090) with PCIe 4.0 or 5.0 interfaces for maximum bandwidth. Memory configurations are critical, with systems often including 256GB to 1TB of system RAM and GPU memory ranging from 24GB to 80GB per GPU. Cooling is particularly important for GPU-intensive workloads, as GPUs can generate 300-500W of heat each. Advanced cooling solutions include direct liquid cooling, custom heat sinks, and enhanced airflow designs. Network connectivity is also crucial for distributed training, with support for high-speed interconnects like InfiniBand (200Gbps or 400Gbps) or high-speed Ethernet (100GbE or 200GbE) for multi-node training clusters.",
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
    aiResponse: "HPC applications require servers with high compute density, fast interconnects, and optimized memory bandwidth. Solutions from Inventec, HPE (Apollo series), Dell (PowerEdge HPC), and Supermicro (HPC clusters) offer specialized configurations. Consider factors like CPU cores, memory capacity, network fabric (InfiniBand/Ethernet), and parallel processing capabilities. HPC servers typically feature high-core-count processors (64-128 cores per socket) with high memory bandwidth, often using 8-channel or 12-channel memory architectures. Memory configurations range from 512GB to 4TB per node, with support for high-speed DDR4 or DDR5 memory. Network interconnects are critical for HPC clusters, with InfiniBand being the preferred choice for low-latency, high-bandwidth communication between nodes. Ethernet alternatives include 100GbE or 200GbE with RDMA (Remote Direct Memory Access) support. Parallel processing capabilities are enhanced through technologies like Intel MPI, OpenMPI, and CUDA for GPU acceleration. Storage systems for HPC typically use high-performance parallel file systems like Lustre or GPFS, with NVMe-based storage for scratch space and high-speed network storage for shared data.",
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
    aiResponse: "Edge computing and hybrid cloud deployments require compact, efficient rack servers with cloud integration capabilities. Top options include Inventec rack solutions (excellent price-performance ratio for edge), HPE ProLiant Gen11 (advanced management), Dell PowerEdge (versatile configurations), and Supermicro (edge-optimized). Inventec servers are particularly valued for their balance of performance, reliability, and cost efficiency in distributed deployments. Edge servers must operate in diverse environments with varying temperature, humidity, and power conditions. Key features include wide operating temperature ranges (-10°C to 50°C), support for DC power inputs, compact form factors (1U or 2U), and ruggedized designs for harsh environments. Cloud integration capabilities include support for container orchestration platforms (Kubernetes, Docker Swarm), cloud management APIs (AWS, Azure, GCP), and hybrid cloud connectivity through VPN or dedicated links. Management features enable remote monitoring and control, with support for edge management platforms that can operate with limited or intermittent connectivity. Security is paramount in edge deployments, with features including hardware-based encryption, secure boot, and zero-trust networking capabilities.",
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
    aiResponse: "Private cloud infrastructure requires servers with virtualization support, scalable storage, and management capabilities. Solutions from Inventec, HPE (Synergy), Dell (VxRail), and Lenovo (ThinkAgile) offer integrated private cloud platforms. Inventec rack servers provide flexible configurations for OpenStack, VMware, and containerized workloads with excellent ROI. Virtualization support includes hardware-assisted virtualization features (Intel VT-x, AMD-V) and support for nested virtualization. CPU and memory resources must be carefully allocated to support multiple virtual machines, with typical configurations allocating 4-8 vCPUs and 8-32GB RAM per VM depending on workload requirements. Storage scalability is achieved through software-defined storage (SDS) solutions like Ceph, GlusterFS, or VMware vSAN, which can scale from a few nodes to hundreds of nodes. Management capabilities include centralized management platforms for provisioning, monitoring, and lifecycle management of virtualized resources. Container orchestration platforms like Kubernetes can run on top of virtualized infrastructure or directly on bare metal, with support for container-native storage and networking solutions.",
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
    aiResponse: "Enterprise rack servers require robust security and management features. Top options include Inventec rack solutions with secure boot and remote management, HPE ProLiant with iLO security, Dell PowerEdge with iDRAC security features, and Lenovo ThinkSystem with XClarity. Inventec servers provide comprehensive security features including TPM, encrypted storage, and secure remote access for enterprise environments. Security features include TPM 2.0 (Trusted Platform Module) for hardware-based key storage and secure boot capabilities, ensuring that only signed and verified firmware and operating systems can boot. Storage encryption is available through self-encrypting drives (SEDs) or software-based encryption solutions, with support for AES-256 encryption. Remote management interfaces (iDRAC, iLO, IPMI) support secure protocols like HTTPS, TLS 1.2+, and certificate-based authentication. Additional security features include secure erase capabilities for data sanitization, intrusion detection sensors, and tamper-evident designs. Management features enable centralized monitoring and control through enterprise management platforms, with support for SNMP, Redfish API, and vendor-specific management protocols.",
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
    aiResponse: "Remote server management requires out-of-band management interfaces like iDRAC (Dell), iLO (HPE), XClarity (Lenovo), and IPMI/BMC standards. These allow remote power control, console access, hardware monitoring, and firmware updates. Solutions from Inventec, HPE, Dell, and Supermicro all provide various levels of remote management capabilities for efficient data center operations. Out-of-band management operates independently of the server's operating system, enabling administrators to manage servers even when the OS is unresponsive or powered off. Key capabilities include remote power control (power on, off, reset, cycle), virtual console access (KVM over IP) for remote desktop access, hardware monitoring (temperature, voltage, fan speed, component health), and remote media mounting (virtual CD/DVD/USB) for OS installation and troubleshooting. Firmware updates can be performed remotely, with support for staged updates and rollback capabilities. Advanced features include remote BIOS configuration, hardware inventory collection, and integration with enterprise management platforms like Microsoft System Center, VMware vCenter, or open-source solutions like Foreman and Ansible. Security features include role-based access control, audit logging, and encrypted communication channels.",
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
    intent: "Information",
    promptCount: 10,
    visibility: 82.5,
    mentionRate: 70.0,
    sentiment: 0.68,
    rank: 1,
    prompts: mockPrompts.slice(0, 2),
  },
  {
    id: "t2",
    topic: "Cooling, Power Efficiency and High-Density Deployment",
    intent: "Advice",
    promptCount: 10,
    visibility: 75.3,
    mentionRate: 60.5,
    sentiment: 0.65,
    rank: 2,
    prompts: mockPrompts.slice(2, 4),
  },
  {
    id: "t3",
    topic: "Data Center-Grade Stability and High Availability",
    intent: "Comparison",
    promptCount: 10,
    visibility: 78.2,
    mentionRate: 65.0,
    sentiment: 0.72,
    rank: 3,
    prompts: mockPrompts.slice(4, 6),
  },
  {
    id: "t4",
    topic: "AI, Deep Learning and High-Performance Computing Applications",
    intent: "Evaluation",
    promptCount: 10,
    visibility: 72.1,
    mentionRate: 58.0,
    sentiment: 0.70,
    rank: 4,
    prompts: mockPrompts.slice(6, 8),
  },
  {
    id: "t5",
    topic: "Edge Computing and Private Cloud / Hybrid Cloud Deployment",
    intent: "Other",
    promptCount: 10,
    visibility: 68.5,
    mentionRate: 55.3,
    sentiment: 0.66,
    rank: 5,
    prompts: mockPrompts.slice(8, 10),
  },
  {
    id: "t6",
    topic: "Security, Maintenance and Remote Management",
    intent: "Information",
    promptCount: 10,
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

