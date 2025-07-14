# Claude Code Project Flow

## Overview
This Claude Code Project flow is used to create control documents for Claude Code to store in its memory and refer to allow it to stay on task through out the project even between sessions.

## Create project files using Claude.ai (Use Claude Opus 4 if available, otherwise Sonnet 4)

1. **Create the PRD** 
    - Sample prompt:
        ```bash
        Help me create a PRD for a web app that allows users to do xyz. I want a clean, modern beautiful app. The app should have features xyz.
        ```
2. **Create CLAUDE.md** 
    - Paste this Prompt into same Claude.ai session:
        ```bash
        Generate a CLAUDE.md file from the PRD that will guide future Claude Code sessions on this project.
        ```
    - Add to CLAUDE.md manually:
        ```bash
        - always read PLANNING.md at the start of every new conversation
        - check TASKS.md before starting your work
        - mark completed tasks immediatly
        - add newly discovered tasks
        ```
3. **Create PLANNING.md** 
    - Paste this Prompt into same Claude.ai session:
        ```bash
        Create a PLANNING.md file that includes vision, architecture, technology stack, and required tools list for this app.
        ```
4. **Create TASK.md** 
    - Paste this Prompt into same Claude.ai session:
        ```bash
        Create a TASKS.md file with bullet points tasks divided into milestones for building this app.
        ```
## Use the created files in the Claude Code CLI terminal
1. **Copy the files into your project directory** 
    ```bash
    cp CLAUDE.md ./project_dir
    cp PLANNING.md ./project_dir
    cp TASKS.md ./project_dir
    ```

2. **Turn on planning mode in Claude Code and run the prompt** 
    - Planning Mode (shift+tab+tab)
        ```bash
        >
        ⏸ plan mode on (shift+tab to cycle)
        ```
    - prompt first session:
        ```bash
        Please read PLANNING.md, CLAUDE.md, and TASKS.md to understand the project. Then complete the first task on TASKS.md
        ```
    - prompt subsequent session:
        ```bash
        Please check PLANNING.md, CLAUDE.md, and TASKS.md to see where we are in the project and then pick up where we left off
        ``` 

3. **Exit Planning mode** 
    ```bash
    Would you like to proceed?

    > 1. Yes
      2. No, keep planning
    ```
4. **Prompt run when done with a session** 
    ```bash
    Please add a session summary to CLAUDE.md summarizing what we’ve done so far
    ```
