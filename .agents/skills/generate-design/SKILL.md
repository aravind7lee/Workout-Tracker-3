---
name: generate-design
description: Generate new screens from text or images, edit existing screens, and create design variants using Stitch MCP.
---

# Stitch Generate Design Skill

Use this skill when the user wants to generate new UI designs, edit existing screens, or generate design variants in Stitch.

## Capabilities
1. **Generate Screen from Text**: Call Stitch MCP `generate_screen_from_text` with project_id and prompt.
2. **Edit Screen**: Call Stitch MCP `edit_screens` with project_id, screen_ids, and modification prompt.
3. **Generate Variants**: Call Stitch MCP `generate_variants` with project_id, screen_id, and prompt.

## Guidelines
- Always verify project_id using `list_projects` or `get_project`.
- Provide detailed, high-aesthetic prompts including color palettes, typography, and density instructions.
