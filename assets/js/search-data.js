// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-resume",
          title: "resume",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "post-potensi-energi-terbarukan-lepas-pantai-di-indonesia",
        
          title: "Potensi Energi Terbarukan Lepas Pantai di Indonesia",
        
        description: "Eksplorasi potensi besar energi terbarukan lepas pantai Indonesia untuk masa depan berkelanjutan",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/energi-terbarukan-lepas-pantai-indonesia/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-rov-survey-for-rig-taurus",
          title: 'ROV Survey for RIG Taurus',
          description: "Underwater inspection project with Pertamina Hulu Energi",
          section: "Projects",handler: () => {
              window.location.href = "/projects/a_rov_taurus/";
            },},{id: "projects-defect-detection-with-deep-learning-computer-vision-in-jetson-nano",
          title: 'Defect Detection with Deep Learning Computer Vision in Jetson Nano',
          description: "Real-time defect detection system for Quality Control using Jetson Nano",
          section: "Projects",handler: () => {
              window.location.href = "/projects/b_toshin_cv/";
            },},{id: "projects-chiller-monitoring-webbased",
          title: 'Chiller Monitoring Webbased',
          description: "A web-based IoT system to monitor chiller machine operations in real time",
          section: "Projects",handler: () => {
              window.location.href = "/projects/c_toshin_chiller/";
            },},{id: "projects-affordable-smart-feeder-for-farmers",
          title: 'Affordable Smart Feeder for Farmers',
          description: "A solar-powered smart feeder to automate the feeding process for traditional farmers",
          section: "Projects",handler: () => {
              window.location.href = "/projects/d_venambak_feederve/";
            },},{id: "projects-automatic-aerator-for-traditional-fish-farmers",
          title: 'Automatic Aerator for Traditional Fish Farmers',
          description: "An upgraded prototype of an affordable automatic aerator system for traditional fish farmers",
          section: "Projects",handler: () => {
              window.location.href = "/projects/e_venambak_autove/";
            },},{id: "projects-e-auv-eepis-autonomous-underwater-vehicle-kri-2023",
          title: 'E-AUV (Eepis Autonomous Underwater Vehicle) – KRI 2023',
          description: "Fully autonomous underwater vehicle for the Indonesian Underwater Robot Contest (KRBAI) 2023",
          section: "Projects",handler: () => {
              window.location.href = "/projects/f_emosver/";
            },},{id: "projects-autonomous-semi-submarine-drone-kkctbn-2022",
          title: 'Autonomous Semi Submarine Drone – KKCTBN 2022',
          description: "Autonomous semi-submarine drone for the National Unmanned Fast Boat Contest (KKCTBN) 2022",
          section: "Projects",handler: () => {
              window.location.href = "/projects/g_assv_2022/";
            },},{id: "projects-electric-remote-control-boat-comet-2023",
          title: 'Electric Remote Control Boat – COMET 2023',
          description: "High-speed electric remote-controlled boat for COMET 2023 national competition",
          section: "Projects",handler: () => {
              window.location.href = "/projects/h_comet_2023/";
            },},{id: "projects-autonomous-tourism-surface-vehicle-kkctbn-2023",
          title: 'Autonomous Tourism Surface Vehicle – KKCTBN 2023',
          description: "AI-assisted autonomous surface vehicle for KKCTBN 2023 competition with RTK GPS navigation and YOLO-based object detection",
          section: "Projects",handler: () => {
              window.location.href = "/projects/i_asv_2023/";
            },},{id: "projects-autonomous-surface-vehicle-support-offshore-kki-2024",
          title: 'Autonomous Surface Vehicle Support Offshore – KKI 2024',
          description: "Autonomous Surface Vehicle prototype for offshore support missions at the Kontes Kapal Indonesia (KKI) 2024 competition",
          section: "Projects",handler: () => {
              window.location.href = "/projects/j_asv_2024/";
            },},{id: "projects-jalavahana-unmanned-autonomous-surface-vehicle-for-offshore-wind-turbine-development-pkm-2024",
          title: 'Jalavahana Unmanned Autonomous Surface Vehicle for Offshore Wind Turbine Development – PKM 2024...',
          description: "Autonomous Surface Vehicle for environmental and geospatial survey to support offshore wind turbine development under Indonesia’s PKM program.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/k_jalavahana/";
            },},{id: "projects-eyesight-machine-vision-for-enhancing-quality-and-production-efficiency",
          title: 'Eyesight – Machine Vision for Enhancing Quality and Production Efficiency',
          description: "Computer vision-based quality inspection system developed as part of Google Bangkit 2024 Capstone Project, designed for UMKM manufacturing sector.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/l_eyesight/";
            },},{id: "projects-smartdoorlock-fingerprint-and-pin-authentication",
          title: 'Smartdoorlock – Fingerprint and PIN Authentication',
          description: "A functional smart doorlock system with multi-factor authentication, developed as part of the Sensors and Actuators course project.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/m_smartdoorlock/";
            },},{id: "projects-bicopter-position-control-system-arduino-pid-control",
          title: 'Bicopter Position Control System – Arduino PID Control',
          description: "Development of a bicopter position control system using Arduino Nano with PID control and Kalman filter.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/n_bicopterpid/";
            },},{id: "projects-balancing-submarine-drone-with-multiwii",
          title: 'Balancing Submarine Drone with MultiWii',
          description: "A personal project repurposing the MultiWii flight controller for underwater balancing, simulating AUV dynamics with low-cost open-source hardware.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/o_submarinedrone/";
            },},{id: "projects-smart-rover-version-1-amp-2",
          title: 'Smart Rover – Version 1 &amp;amp; 2',
          description: "A personal robotics project developing an omnidirectional autonomous ground vehicle, enhanced with robotic arm and computer vision.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/p_smartrover/";
            },},{id: "projects-jaladhi-autonomous-surface-vehicle-with-collision-avoidance",
          title: 'Jaladhi – Autonomous Surface Vehicle with Collision Avoidance',
          description: "Final project focused on offshore energy exploration with autonomous navigation and collision avoidance following COLREGs.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/q_jaladhi/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%61%63%68%61%64%61%6E%73%6F%72%69@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/achadansori", "_blank");
        },
      },{
        id: 'social-instagram',
        title: 'Instagram',
        section: 'Socials',
        handler: () => {
          window.open("https://instagram.com/achadansori", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/achadansori", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
