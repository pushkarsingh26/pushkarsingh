import { motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";

export default function About() {
  const navigate = useNavigate();
  const text = "About Myself";

  const [displayedText, setDisplayedText] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // TYPING EFFECT
  useEffect(() => {
    let index = 0;
    let interval;

    const startTyping = () => {
      setDisplayedText("");
      interval = setInterval(() => {
        index++;
        setDisplayedText(text.slice(0, index));

        if (index === text.length) {
          clearInterval(interval);
          setTimeout(() => {
            index = 0;
            startTyping();
          }, 5000);
        }
      }, 120);
    };

    startTyping();
    return () => clearInterval(interval);
  }, []);

  // DOWNLOAD FUNCTION - FIXED
  const handleDownload = () => {
    if (downloading) return;

    setDownloading(true);
    setCountdown(3);

    let time = 3;

    const timer = setInterval(() => {
      time--;
      setCountdown(time);

      if (time <= 0) {
        clearInterval(timer);

        // Create a complete HTML document for PDF
        const resumeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pushkar Chhokar - Resume</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
            --bg-main: #05070f;
            --bg-card: #0b0f19;
            --border-color: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent-indigo: #6366f1;
            --accent-purple: #a855f7;
            --accent-cyan: #06b6d4;
            --gradient-primary: linear-gradient(135deg, var(--accent-indigo), var(--accent-purple));
            --gradient-cyan-purple: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            height: 100%;
        }

        body {
            background-color: var(--bg-main);
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            line-height: 1.6;
            padding: 40px 20px;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container {
            max-width: 950px;
            margin: 0 auto;
        }

        .resume-wrapper {
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            overflow: hidden;
            transition: all 0.3s ease;
        }

        /* Header */
        .header {
            background: linear-gradient(180deg, #090d16 0%, var(--bg-card) 100%);
            border-bottom: 1px solid var(--border-color);
            padding: 45px;
            display: flex;
            gap: 35px;
            align-items: center;
        }

        .avatar-container {
            flex-shrink: 0;
        }

        .profile-avatar {
            width: 110px;
            height: 110px;
            border-radius: 24px;
            background: var(--gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38px;
            font-weight: 700;
            color: #ffffff;
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
        }

        .profile-avatar:hover {
            transform: translateY(-5px) rotate(3deg);
            box-shadow: 0 15px 30px rgba(168, 85, 247, 0.5);
        }

        .header-content {
            flex: 1;
        }

        .header-content h1 {
            font-size: 38px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 6px;
            background: linear-gradient(135deg, #ffffff 40%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-content .title {
            font-size: 15px;
            color: var(--accent-cyan);
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13.5px;
            color: var(--text-secondary);
            transition: color 0.2s ease;
        }

        .contact-item svg {
            color: var(--accent-indigo);
            flex-shrink: 0;
            transition: transform 0.2s ease;
        }

        .contact-item a {
            color: var(--text-secondary);
            text-decoration: none;
            word-break: break-all;
            transition: color 0.2s ease;
        }

        .contact-item:hover {
            color: var(--text-primary);
        }

        .contact-item:hover a {
            color: var(--text-primary);
        }

        .contact-item:hover svg {
            transform: scale(1.1);
            color: var(--accent-cyan);
        }

        /* Sections */
        .content-body {
            padding: 45px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--text-primary);
            margin-bottom: 22px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-cyan);
        }

        /* Summary Card */
        .summary-card {
            background: #0f1322;
            border: 1px solid #1e293b;
            padding: 20px 24px;
            border-radius: 12px;
            font-size: 14.5px;
            color: var(--text-secondary);
            line-height: 1.8;
            position: relative;
            overflow: hidden;
        }

        .summary-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--gradient-primary);
        }

        /* Projects */
        .project-card {
            background: #0e1220;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .project-card:last-child {
            margin-bottom: 0;
        }

        .project-card:hover {
            border-color: #334155;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .project-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .project-links {
            display: flex;
            gap: 10px;
        }

        .project-link-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            padding: 5px 10px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 6px;
            color: var(--text-primary);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .project-link-btn:hover {
            background: var(--accent-indigo);
            border-color: var(--accent-indigo);
            transform: translateY(-1px);
        }

        .project-link-btn svg {
            flex-shrink: 0;
        }

        .project-tech {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12.5px;
            color: var(--accent-cyan);
            margin-bottom: 15px;
        }

        .project-points {
            list-style-type: none;
        }

        .project-points li {
            font-size: 13.5px;
            color: var(--text-secondary);
            margin-bottom: 8px;
            position: relative;
            padding-left: 18px;
            line-height: 1.6;
        }

        .project-points li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--accent-purple);
            font-weight: bold;
        }

        .project-points li:last-child {
            margin-bottom: 0;
        }

        /* Skills */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .skill-card {
            background: #0e1220;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .skill-card:hover {
            border-color: #334155;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .skill-card h3 {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-primary);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            letter-spacing: 0.5px;
        }

        .skill-card h3 svg {
            color: var(--accent-cyan);
            flex-shrink: 0;
        }

        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .skill-tag {
            background: #1e293b;
            border: 1px solid #334155;
            color: var(--text-secondary);
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .skill-tag:hover {
            background: var(--gradient-primary);
            border-color: transparent;
            color: #ffffff;
            transform: translateY(-1px);
        }

        /* Experiences */
        .exp-timeline {
            position: relative;
            padding-left: 20px;
        }

        .exp-timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 5px;
            bottom: 5px;
            width: 2px;
            background: var(--border-color);
        }

        .exp-item {
            position: relative;
            margin-bottom: 30px;
        }

        .exp-item:last-child {
            margin-bottom: 0;
        }

        .exp-item::before {
            content: '';
            position: absolute;
            left: -26px;
            top: 6px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--bg-card);
            border: 2px solid var(--accent-indigo);
            transition: all 0.3s ease;
        }

        .exp-item:hover::before {
            background: var(--accent-cyan);
            border-color: var(--accent-cyan);
            box-shadow: 0 0 8px var(--accent-cyan);
        }

        .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .exp-title-group h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .exp-title-group p {
            font-size: 13px;
            color: var(--accent-cyan);
            font-weight: 500;
        }

        .exp-date {
            font-size: 12.5px;
            color: var(--text-secondary);
        }

        .exp-points {
            list-style-type: none;
            margin-top: 10px;
        }

        .exp-points li {
            font-size: 13.5px;
            color: var(--text-secondary);
            margin-bottom: 6px;
            position: relative;
            padding-left: 18px;
        }

        .exp-points li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent-indigo);
        }

        .exp-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 8px;
            font-size: 12px;
            color: var(--accent-purple);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .exp-link:hover {
            text-decoration: underline;
            color: var(--accent-cyan);
        }

        /* Certifications & Research */
        .certs-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
        }

        .cert-item {
            background: #0e1220;
            border: 1px solid var(--border-color);
            padding: 16px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            transition: all 0.2s ease;
        }

        .cert-item:hover {
            border-color: #334155;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .cert-info h4 {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1.4;
        }

        .cert-info p {
            font-size: 12.5px;
            color: var(--text-secondary);
            margin-top: 2px;
        }

        .cert-badge {
            background: rgba(168, 85, 247, 0.1);
            color: var(--accent-purple);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .copyright-card {
            background: #0f1322;
            border: 1px solid var(--border-color);
            border-left: 3px solid var(--accent-cyan);
            border-radius: 10px;
            padding: 20px;
        }

        .copyright-card h4 {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 6px;
        }

        .copyright-card p {
            font-size: 13.5px;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        /* Education */
        .edu-card {
            background: #0e1220;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            transition: all 0.2s ease;
        }

        .edu-card:hover {
            border-color: #334155;
        }

        .edu-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .edu-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .edu-loc {
            font-size: 13px;
            color: var(--text-secondary);
        }

        .edu-degree {
            font-size: 14.5px;
            color: var(--accent-cyan);
            font-weight: 500;
            margin-bottom: 12px;
        }

        .edu-meta {
            font-size: 13px;
            color: var(--text-secondary);
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .edu-meta span {
            background: #1e293b;
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid #334155;
            font-weight: 500;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: #05070f;
        }

        ::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #334155;
        }

        /* Responsive Layout */
        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 30px 20px;
            }

            .header-content h1 {
                font-size: 30px;
            }

            .contact-grid {
                grid-template-columns: 1fr;
                justify-items: center;
            }

            .contact-item {
                justify-content: center;
            }

            .content-body {
                padding: 25px 20px;
            }

            .project-header {
                flex-direction: column;
                gap: 10px;
            }

            .edu-header {
                flex-direction: column;
                gap: 5px;
            }
        }

        /* Print Settings */
        @media print {
            body {
                background: #ffffff;
                color: #000000;
                padding: 0;
            }
            .resume-wrapper {
                border: none;
                box-shadow: none;
                background: #ffffff;
            }
            .header {
                background: #ffffff;
                border-bottom: 2px solid #000000;
                padding: 20px 0;
            }
            .header-content h1 {
                background: none;
                -webkit-text-fill-color: initial;
                color: #000000;
            }
            .profile-avatar {
                background: #cccccc;
                color: #000000;
                border: 2px solid #000000;
                box-shadow: none;
            }
            .content-body {
                padding: 20px 0;
            }
            .section-title {
                color: #000000;
                border-bottom: 2px solid #000000;
            }
            .section-title::before {
                display: none;
            }
            .summary-card {
                background: #ffffff;
                border: 1px solid #cccccc;
                color: #000000;
            }
            .project-card, .skill-card, .cert-item, .edu-card, .copyright-card {
                background: #ffffff;
                border: 1px solid #cccccc;
                color: #000000;
                box-shadow: none;
            }
            .project-title, .skill-card h3, .cert-info h4, .edu-name, .copyright-card h4 {
                color: #000000;
            }
            .project-tech {
                color: #555555;
            }
            .skill-tag, .edu-meta span, .project-link-btn {
                background: #f0f0f0;
                border: 1px solid #cccccc;
                color: #000000;
            }
            .exp-item::before {
                border-color: #000000;
            }
            .exp-title-group p {
                color: #333333;
            }
            .project-link-btn {
                display: none;
            }
            .exp-link {
                color: #000000;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="resume-wrapper">
            <!-- Header -->
            <div class="header">
                <div class="avatar-container">
                    <div class="profile-avatar">PC</div>
                </div>
                <div class="header-content">
                    <h1>Pushkar Chhokar</h1>
                    <p class="title">GenAI-focused Computer Science Undergraduate | B.Tech CSE</p>
                    <div class="contact-grid">
                        <div class="contact-item">
                            <!-- Map Pin SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>Indore, M.P., India</span>
                        </div>
                        <div class="contact-item">
                            <!-- Phone SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <a href="tel:+917389530419">+91-7389530419</a>
                        </div>
                        <div class="contact-item">
                            <!-- Mail SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <a href="mailto:pushkarcd123@gmail.com">pushkarcd123@gmail.com</a>
                        </div>
                        <div class="contact-item">
                            <!-- LinkedIn SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            <a href="https://www.linkedin.com/in/pushkar-chhokar" target="_blank">pushkar-chhokar</a>
                        </div>
                        <div class="contact-item">
                            <!-- GitHub SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            <a href="https://github.com/pushkarsingh26" target="_blank">pushkarsingh26</a>
                        </div>
                        <div class="contact-item">
                            <!-- Globe SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            <a href="https://pushkarsingh26.github.io/pushkarsingh/" target="_blank">Portfolio Website</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Body -->
            <div class="content-body">
                <!-- Professional Summary -->
                <section class="section">
                    <h2 class="section-title">Career Objective</h2>
                    <div class="summary-card">
                        GenAI-focused Computer Science undergraduate with hands-on experience building production-ready RAG applications using FastAPI, LangChain, FAISS, and LLM APIs. Seeking internships in Generative AI, Machine Learning, or AI Backend Engineering.
                    </div>
                </section>

                <!-- Technical Skills -->
                <section class="section">
                    <h2 class="section-title">Technical Skills</h2>
                    <div class="skills-grid">
                        <div class="skill-card">
                            <h3>
                                <!-- Code Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                Generative AI & LLMs
                            </h3>
                            <div class="skill-tags">
                                <span class="skill-tag">OpenAI GPT</span>
                                <span class="skill-tag">Anthropic Claude</span>
                                <span class="skill-tag">Meta Llama</span>
                                <span class="skill-tag">Google Gemini</span>
                                <span class="skill-tag">RAG</span>
                                <span class="skill-tag">Prompt Engineering</span>
                                <span class="skill-tag">Tokenization</span>
                            </div>
                        </div>

                        <div class="skill-card">
                            <h3>
                                <!-- CPU Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
                                Agentic AI & Orchestration
                            </h3>
                            <div class="skill-tags">
                                <span class="skill-tag">LangChain</span>
                                <span class="skill-tag">Model Context Protocol (MCP)</span>
                                <span class="skill-tag">Agent Skills (Anthropic-certified)</span>
                            </div>
                        </div>

                        <div class="skill-card">
                            <h3>
                                <!-- Database Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>
                                Vector DBs & Retrieval
                            </h3>
                            <div class="skill-tags">
                                <span class="skill-tag">FAISS</span>
                                <span class="skill-tag">Semantic Search</span>
                                <span class="skill-tag">Embedding Pipelines</span>
                                <span class="skill-tag">HuggingFace</span>
                                <span class="skill-tag">SentenceTransformers</span>
                            </div>
                        </div>

                        <div class="skill-card">
                            <h3>
                                <!-- Hard Drive Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
                                Backend & APIs
                            </h3>
                            <div class="skill-tags">
                                <span class="skill-tag">FastAPI</span>
                                <span class="skill-tag">REST API Design</span>
                                <span class="skill-tag">SQLite</span>
                                <span class="skill-tag">MySQL</span>
                            </div>
                        </div>

                        <div class="skill-card">
                            <h3>
                                <!-- Terminal Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                                Languages & Frontend
                            </h3>
                            <div class="skill-tags">
                                <span class="skill-tag">Python</span>
                                <span class="skill-tag">SQL</span>
                                <span class="skill-tag">C / C++</span>
                                <span class="skill-tag">HTML</span>
                                <span class="skill-tag">CSS</span>
                                <span class="skill-tag">React</span>
                                <span class="skill-tag">Streamlit</span>
                            </div>
                        </div>

                        <div class="skill-card">
                            <h3>
                                <!-- Tool Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                                Tools & Upskilling
                            </h3>
                            <div class="skill-tags">
                                <span class="skill-tag">Git & GitHub</span>
                                <span class="skill-tag">Vercel</span>
                                <span class="skill-tag">VS Code</span>
                                <span class="skill-tag">Antigravity</span>
                                <span class="skill-tag">Cursor</span>
                                <span class="skill-tag">NumPy</span>
                                <span class="skill-tag">Pandas</span>
                                <span class="skill-tag">Matplotlib</span>
                                <span class="skill-tag">PyTorch</span>
                                <span class="skill-tag">LoRA Fine-Tuning</span>
                                <span class="skill-tag">Cloud AI Deployment</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Projects -->
                <section class="section">
                    <h2 class="section-title">Projects</h2>
                    <div class="project-card">
                        <div class="project-header">
                            <h3 class="project-title">AI Learning Copilot</h3>
                            <div class="project-links">
                                <a href="https://github.com/pushkarsingh26/AI-Learning-Copilot" target="_blank" class="project-link-btn">
                                    <!-- GitHub SVG -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                    Code
                                </a>
                                <a href="https://ai-learning-copilot-vknhansxzzrccw6prweg6s.streamlit.app/" target="_blank" class="project-link-btn">
                                    <!-- Globe SVG -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                    Live
                                </a>
                            </div>
                        </div>
                        <p class="project-tech">Python, FastAPI, LangChain, FAISS, OpenRouter, SQLite, Streamlit</p>
                        <ul class="project-points">
                            <li>Engineered a full-stack RAG-powered learning platform using FastAPI, LangChain, FAISS, and OpenRouter, enabling contextual PDF Q&A, quiz generation, and flashcard creation across documents up to 80 pages.</li>
                            <li>Architected a semantic retrieval pipeline with HuggingFace all-MiniLM-L6-v2 embeddings and FAISS vector indexing, achieving sub-2-second retrieval latency across multi-document knowledge bases containing up to 10 PDFs.</li>
                            <li>Developed 8+ REST API endpoints and a personalized learning engine with SQLite-based analytics, adaptive quiz generation, progress tracking, and weak-topic detection to improve learning efficiency and retention.</li>
                        </ul>
                    </div>

                    <div class="project-card">
                        <div class="project-header">
                            <h3 class="project-title">AI Resume Analyzer</h3>
                            <div class="project-links">
                                <a href="https://github.com/pushkarsingh26/AI-Resume-Analyzer" target="_blank" class="project-link-btn">
                                    <!-- GitHub SVG -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                    Code
                                </a>
                                <a href="https://ai-resume-analyzer-pushkarsingh26.vercel.app/" target="_blank" class="project-link-btn">
                                    <!-- Globe SVG -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                    Live
                                </a>
                            </div>
                        </div>
                        <p class="project-tech">Python, FastAPI, React, LangChain, OpenRouter, SentenceTransformers</p>
                        <ul class="project-points">
                            <li>Built a production-deployed AI-powered resume analysis platform using FastAPI, React, LangChain, and OpenRouter, generating ATS compatibility scores, domain classification, and personalized career recommendations.</li>
                            <li>Implemented a custom RAG pipeline with SentenceTransformers (all-MiniLM-L6-v2) and cosine similarity search, enabling contextual resume Q&A while eliminating the need for external vector databases.</li>
                            <li>Developed 6+ REST API endpoints for resume analysis, interview question generation, and domain classification, and deployed the application on Vercel with an interactive React frontend supporting ATS scoring, AI chat, and interview preparation.</li>
                        </ul>
                    </div>
                </section>

                <!-- Virtual Experience -->
                <section class="section">
                    <h2 class="section-title">Virtual Experience</h2>
                    <div class="exp-timeline">
                        <div class="exp-item">
                            <div class="exp-header">
                                <div class="exp-title-group">
                                    <h3>BCG X – GenAI Job Simulation</h3>
                                    <p>Forage</p>
                                </div>
                                <span class="exp-date">June 2026</span>
                            </div>
                            <ul class="exp-points">
                                <li>Built an AI-powered financial chatbot using Large Language Models (LLMs) for financial document question answering.</li>
                                <li>Extracted, processed, and analyzed structured financial data to support intelligent retrieval and response generation.</li>
                                <li>Applied Prompt Engineering, Generative AI, and Natural Language Processing (NLP) concepts to solve real-world business use cases.</li>
                            </ul>
                            <a href="https://www.theforage.com/completion-certificates/SKZxezskWgmFjRvj9/gabev3vXhuACr48eb_SKZxezskWgmFjRvj9_6a3f8babb7a05e87c4307388_1782735957264_completion_certificate.pdf" target="_blank" class="exp-link">
                                <!-- Link Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                View Completion Certificate
                            </a>
                        </div>

                        <div class="exp-item">
                            <div class="exp-header">
                                <div class="exp-title-group">
                                    <h3>EAB – GenAI for Proposal Generation Job Simulation</h3>
                                    <p>Forage</p>
                                </div>
                                <span class="exp-date">June 2026</span>
                            </div>
                            <ul class="exp-points">
                                <li>Created AI-assisted hypothesis proposals using Generative AI for higher education institutions.</li>
                                <li>Refined proposal content through iterative discovery by incorporating stakeholder feedback and evolving business requirements.</li>
                                <li>Applied Prompt Engineering, business analysis, and value-selling strategies to improve proposal quality and client outcomes.</li>
                            </ul>
                            <a href="https://www.theforage.com/completion-certificates/PSJm5xBFZtjjf9AnA/i2nMh36aEWT7awGCa_PSJm5xBFZtjjf9AnA_6a3f8babb7a05e87c4307388_1782736378418_completion_certificate.pdf" target="_blank" class="exp-link">
                                <!-- Link Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                View Completion Certificate
                            </a>
                        </div>

                        <div class="exp-item">
                            <div class="exp-header">
                                <div class="exp-title-group">
                                    <h3>Deloitte – Data Analytics Job Simulation</h3>
                                    <p>Forage</p>
                                </div>
                                <span class="exp-date">June 2026</span>
                            </div>
                            <ul class="exp-points">
                                <li>Performed data analysis and forensic technology tasks within a simulated consulting environment.</li>
                                <li>Analyzed datasets to identify trends, anomalies, and actionable business insights using analytical problem-solving techniques.</li>
                                <li>Strengthened data interpretation, critical thinking, and decision-making skills through practical client-oriented scenarios.</li>
                            </ul>
                            <a href="https://www.theforage.com/completion-certificates/9PBTqmSxAf6zZTseP/io9DzWKe3PTsiS6GG_9PBTqmSxAf6zZTseP_6a3f8babb7a05e87c4307388_1782551181008_completion_certificate.pdf" target="_blank" class="exp-link">
                                <!-- Link Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                View Completion Certificate
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Certifications -->
                <section class="section">
                    <h2 class="section-title">Certifications</h2>
                    <div class="certs-list">
                        <div class="cert-item">
                            <div class="cert-info">
                                <h4>Claude with the Anthropic API</h4>
                                <p>Anthropic</p>
                            </div>
                            <span class="cert-badge">2026</span>
                        </div>
                        <div class="cert-item">
                            <div class="cert-info">
                                <h4>Introduction to Model Context Protocol (MCP)</h4>
                                <p>Anthropic</p>
                            </div>
                            <span class="cert-badge">2026</span>
                        </div>
                        <div class="cert-item">
                            <div class="cert-info">
                                <h4>Introduction to Agent Skills</h4>
                                <p>Anthropic</p>
                            </div>
                            <span class="cert-badge">2026</span>
                        </div>
                        <div class="cert-item">
                            <div class="cert-info">
                                <h4>Gen AI: Beyond the Chatbot</h4>
                                <p>Google Cloud</p>
                            </div>
                            <span class="cert-badge">2026</span>
                        </div>
                        <div class="cert-item">
                            <div class="cert-info">
                                <h4>Generative AI: Foundation Models and Platforms</h4>
                                <p>IBM</p>
                            </div>
                            <span class="cert-badge">2026</span>
                        </div>
                    </div>
                </section>

                <!-- Research & Achievements -->
                <section class="section">
                    <h2 class="section-title">Research & Achievements</h2>
                    <div class="copyright-card">
                        <h4>Registered Copyright: "Copyright Issues in Generative AI"</h4>
                        <p>Authored and obtained official copyright registration for an extensive analysis focusing on intellectual property challenges, copyright infringement concerns, and legal implications of LLM-generated content (2026).</p>
                    </div>
                </section>

                <!-- Education -->
                <section class="section">
                    <h2 class="section-title">Education</h2>
                    <div class="edu-card">
                        <div class="edu-header">
                            <h3 class="edu-name">Acropolis Institute of Technology and Research</h3>
                            <span class="edu-loc">Indore, M.P.</span>
                        </div>
                        <p class="edu-degree">B.Tech – Computer Science and Engineering</p>
                        <div class="edu-meta">
                            <span>Duration: Sep 2023 – Jun 2027</span>
                            <span>CGPA: 6.85</span>
                            <span>Enrollment: 0827CS231204</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const blob = new Blob([resumeHTML], {
          type: "text/html"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "Pushkar_Chhokar_Resume.html";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        setDownloading(false);
        setCountdown(null);
      }
    }, 1000);
  };


  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white px-4 sm:px-6 py-10">
      {/* ANIMATED BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate(-1)}
        className="
          fixed
          top-5
          left-5
          z-50
          flex
          items-center
          gap-2
          px-4
          py-2
          rounded-full
          border
          border-white/15
          bg-white/8
          backdrop-blur-xl
          hover:bg-white/15
          hover:border-white/30
          transition-all
          duration-300
          shadow-lg
        "
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Back</span>
      </motion.button>

      {/* MAIN CONTENT */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen gap-8">

        {/* IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex flex-col items-center"
        >
          <img
            src="/assets/pushkar.png"
            alt="Pushkar Chhokar"
            className="
              w-[200px]
              sm:w-[280px]
              md:w-[320px]
              rounded-2xl
              border
              border-white/15
              object-cover
              shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              hover:border-white/25
              transition-all
              duration-300
            "
          />

          {/* DIVIDER LINE */}
          <div
            className="
              mt-6
              h-[1px]
              bg-gradient-to-r
              from-transparent
              via-white/20
              to-transparent
              w-[90vw]
              sm:w-[400px]
              md:w-[500px]
            "
          />
        </motion.div>

        {/* GLASS BOX CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            w-full
            max-w-4xl
            h-[500px]
            sm:h-[550px]
            md:h-[600px]
            rounded-3xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-3xl
            overflow-hidden
            shadow-[0_20px_70px_rgba(0,0,0,0.5)]
            group
          "
        >
          {/* GLASS LIGHT EFFECT */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

          {/* HEADER SECTION */}
          <div
            className="
              relative
              z-20
              flex
              items-center
              justify-center
              px-6
              py-6
              sm:py-8
              border-b
              border-white/10
              bg-black/30
              backdrop-blur-2xl
            "
          >
            <h1
              className="
                text-3xl
                sm:text-4xl
                md:text-5xl
                font-extrabold
                tracking-tight
              "
            >
              {displayedText}
              <span className="animate-pulse ml-2">|</span>
            </h1>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div
            className="
              relative
              z-10
              h-[calc(100%-80px)]
              overflow-y-auto
              px-6
              sm:px-10
              md:px-12
              py-8
              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-white/10
              hover:scrollbar-thumb-white/20
            "
          >
            <div
              className="
                text-white/70
                text-sm
                sm:text-base
                leading-8
                tracking-wide
                space-y-6
              "
            >
              # About Me
<p>
I'm a Computer Science undergraduate with a strong interest in Artificial Intelligence, Generative AI, and backend development. I enjoy building intelligent applications that solve real-world problems through modern technologies.
</p><p>
My journey into AI began with curiosity and has grown into a passion for creating practical, user-focused solutions. I believe the best way to learn is by building projects that challenge me to think differently.
</p><p>
I work primarily with Python, FastAPI, React, LangChain, LlamaIndex, SQL, Git, Docker, and Vector Databases. I'm always exploring new tools and frameworks to expand my technical skills.
</p><p>
I enjoy designing AI-powered applications such as RAG systems, AI agents, document intelligence platforms, and workflow automation tools. Building scalable and maintainable software is something I continuously strive for.
</p><p>
Beyond writing code, I focus on understanding system design, clean architecture, and software engineering principles that make applications reliable and easy to maintain.
</p><p>
I'm a lifelong learner who enjoys experimenting with emerging AI technologies, reading technical documentation, and turning ideas into working products.
</p><p>
My goal is to grow into an AI Software Engineer who builds impactful products, contributes to innovative teams, and creates technology that makes a meaningful difference.
</p>
              
            </div>
          </div>
        </motion.div>

        {/* DOWNLOAD BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.4,
          }}
          onClick={handleDownload}
          disabled={downloading}
          className="
            group
            relative
            overflow-hidden
            flex
            items-center
            justify-center
            gap-3
            px-8
            sm:px-10
            py-3
            sm:py-4
            rounded-2xl
            border
            border-white/15
            bg-white/8
            backdrop-blur-xl
            hover:bg-white/15
            hover:border-white/30
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition-all
            duration-300
            shadow-[0_10px_40px_rgba(0,0,0,0.4)]
            hover:shadow-[0_15px_50px_rgba(255,255,255,0.08)]
          "
        >
          {/* BUTTON GLOW EFFECT */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* BUTTON CONTENT */}
          <div className="relative z-10 flex items-center gap-3">
            <Download
              size={20}
              className="
                group-hover:scale-110
                group-hover:-translate-y-1
                transition-all
                duration-300
              "
            />
            <span className="font-semibold tracking-wide">
              {downloading ? `Downloading in ${countdown}s` : "Download Resume"}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}