"""
Skill Taxonomy — maps specific frameworks/tools to parent skills.
Also includes dependency-based proficiency boosting.
"""

SKILL_TAXONOMY = {
    # ── Frontend ──
    "react": ["javascript", "frontend"],
    "react.js": ["javascript", "frontend"],
    "reactjs": ["javascript", "frontend"],
    "next.js": ["javascript", "react", "frontend"],
    "nextjs": ["javascript", "react", "frontend"],
    "angular": ["javascript", "typescript", "frontend"],
    "vue": ["javascript", "frontend"],
    "vue.js": ["javascript", "frontend"],
    "svelte": ["javascript", "frontend"],
    "tailwindcss": ["css", "frontend"],
    "tailwind css": ["css", "frontend"],
    "bootstrap": ["css", "frontend"],
    "sass": ["css"],

    # ── JavaScript / Node.js ──
    "node.js": ["javascript", "backend"],
    "nodejs": ["javascript", "backend"],
    "express": ["javascript", "node.js", "backend"],
    "express.js": ["javascript", "node.js", "backend"],
    "typescript": ["javascript"],

    # ── Python ──
    "flask": ["python", "backend", "rest apis"],
    "django": ["python", "backend", "rest apis"],
    "fastapi": ["python", "backend", "rest apis"],
    "pandas": ["python", "data analysis"],
    "numpy": ["python", "data analysis"],
    "scikit-learn": ["python", "machine learning"],
    "sklearn": ["python", "machine learning"],
    "tensorflow": ["python", "machine learning", "deep learning"],
    "pytorch": ["python", "machine learning", "deep learning"],
    "keras": ["python", "machine learning", "deep learning"],
    "opencv": ["python", "computer vision"],
    "spacy": ["python", "nlp"],
    "nltk": ["python", "nlp"],
    "transformers": ["python", "machine learning", "nlp"],
    "hugging face": ["python", "machine learning", "nlp"],

    # ── AI / ML / NLP ──
    "bert": ["machine learning", "nlp", "deep learning"],
    "gpt": ["machine learning", "nlp", "deep learning"],
    "llm": ["machine learning", "nlp"],
    "openai": ["machine learning", "nlp", "apis"],
    "langchain": ["python", "machine learning", "nlp"],
    "rag": ["machine learning", "nlp"],
    "computer vision": ["machine learning"],
    "nlp": ["machine learning"],
    "deep learning": ["machine learning"],

    # ── Java ──
    "spring boot": ["java", "backend"],
    "spring": ["java", "backend"],
    "hibernate": ["java", "orm", "databases"],

    # ── Databases ──
    "postgresql": ["sql", "databases"],
    "mysql": ["sql", "databases"],
    "mongodb": ["nosql", "databases"],
    "redis": ["databases", "caching"],
    "prisma": ["orm", "databases"],
    "sequelize": ["orm", "databases", "javascript"],
    "sqlite": ["sql", "databases"],
    "firebase": ["databases", "cloud computing"],
    "supabase": ["databases", "backend"],

    # ── DevOps / Cloud ──
    "docker": ["devops", "containerization"],
    "kubernetes": ["devops", "containerization"],
    "aws": ["cloud computing"],
    "azure": ["cloud computing"],
    "gcp": ["cloud computing"],
    "ci/cd": ["devops"],
    "github actions": ["devops", "ci/cd"],
    "jenkins": ["devops", "ci/cd"],
    "terraform": ["devops", "cloud computing"],
    "nginx": ["devops", "backend"],
    "linux": ["devops"],

    # ── Version Control ──
    "git": ["version control"],
    "github": ["version control", "git"],

    # ── APIs / Protocols ──
    "rest apis": ["backend"],
    "rest api": ["backend"],
    "graphql": ["backend", "apis"],
    "websocket": ["backend", "apis"],
    "grpc": ["backend", "apis"],

    # ── Automation / Low-code ──
    "n8n": ["automation", "workflow automation"],
    "zapier": ["automation", "workflow automation"],
    "selenium": ["testing", "automation"],
    "puppeteer": ["testing", "automation", "javascript"],
    "playwright": ["testing", "automation"],

    # ── Security ──
    "jwt": ["authentication", "security", "backend"],
    "oauth": ["authentication", "security"],
    "bcrypt": ["security", "authentication"],
    "cybersecurity": ["security"],

    # ── Testing ──
    "jest": ["testing", "javascript"],
    "pytest": ["testing", "python"],
    "junit": ["testing", "java"],
    "mocha": ["testing", "javascript"],
    "cypress": ["testing", "frontend"],

    # ── C / C++ / C# / .NET ──
    "c++": ["c"],
    "c#": [".net"],
    "asp.net": [".net", "backend"],
    "unity": ["c#", "game development"],

    # ── Mobile ──
    "flutter": ["dart", "mobile development"],
    "react native": ["javascript", "react", "mobile development"],
    "swift": ["ios development", "mobile development"],
    "kotlin": ["android development", "mobile development", "java"],

    # ── Data / Visualization ──
    "power bi": ["data analysis", "data visualization"],
    "tableau": ["data analysis", "data visualization"],
    "matplotlib": ["python", "data visualization"],
    "excel": ["data analysis"],

    # ── Browser Extensions ──
    "browser extension": ["javascript", "frontend"],
    "chrome extension": ["javascript", "frontend", "browser extension"],
}

# Additional standalone skills that are not in the taxonomy but should be recognized
EXTRA_SKILLS = [
    "html", "css", "javascript", "python", "java", "c", "c++", "c#", "ruby",
    "php", "go", "golang", "rust", "scala", "r", "perl", "dart", "swift",
    "kotlin", "sql", "nosql", "bash", "shell scripting", "powershell",
    "frontend", "backend", "full stack", "devops", "machine learning",
    "data science", "data analysis", "data visualization", "data engineering",
    "databases", "apis", "rest apis", "testing", "automation",
    "cloud computing", "security", "authentication", "version control",
    "agile", "scrum", "kanban", "jira", "figma", "photoshop",
    "n8n", "jwt", "bert", "gpt", "llm", "openai", "langchain",
    "web scraping", "web development", "api development",
    "linux", "windows", "macos", "android", "ios",
    "microservices", "serverless", "orm", "caching",
    "blockchain", "web3", "solidity", "ethereum",
]

# Proficiency boost rules
CORE_LANGUAGE_PARENTS = {
    "python", "javascript", "java", "c", "c#", "dart", "sql", "css",
}


def expand_skills(skills: list[dict], min_proficiency: int = 1) -> list[dict]:
    """
    Expand skills via taxonomy and boost parent proficiency intelligently.
    If a child skill (Flask) is at level 3, the parent language (Python) 
    should be at least 3, or +1 for core language parents (capped at 5).
    """
    skill_map = {}

    # First pass: add all direct skills
    for s in skills:
        name = s["skillName"].lower().strip()
        prof = s["proficiency"]
        if name not in skill_map or prof > skill_map[name]:
            skill_map[name] = prof

    # Second pass: expand via taxonomy with proficiency boosting
    for s in skills:
        name = s["skillName"].lower().strip()
        prof = s["proficiency"]

        if name in SKILL_TAXONOMY and prof >= min_proficiency:
            for parent in SKILL_TAXONOMY[name]:
                parent_lower = parent.lower()
                # For core language parents, boost by +1 (capped at 5)
                if parent_lower in CORE_LANGUAGE_PARENTS:
                    boosted = min(prof + 1, 5)
                else:
                    boosted = prof

                if parent_lower not in skill_map or boosted > skill_map[parent_lower]:
                    skill_map[parent_lower] = boosted

    return [{"skillName": k, "proficiency": v} for k, v in skill_map.items()]
