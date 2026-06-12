export default {
  id: 'metabuff-autonomous',
  version: '1.0.0',
  model: (() => {
    try {
      return require('./model-config').resolveModel()
    } catch {
      return 'deepseek/deepseek-v4-pro'
    }
  })(),
  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'high',
  },
  toolNames: ['spawn_agents', 'think_deeply', 'run_terminal_command', 'read_files', 'write_file', 'code_search', 'find_files', 'end_turn'],
  spawnableAgents: [
    'ecc-code-architect',
    'metabuff-validator',
    'metabuff-mega',
    'ecc-planner',
    'code-reviewer-deepseek',
    'metabuff-resume'
  ],
  systemPrompt: "You work until the task is COMPLETE: all tests pass, all phases verified, docs updated. COMPLETE means done, not attempted.",
  
  handleSteps: function* ({ prompt }: { prompt: string }) {
    const fs = require('fs')
    const path = require('path')
    const AUTONOMOUS_SESSION_FILE = '.agents/.autonomous-session.json'
    const PHASES_FILE = '.agents/.autonomous-phases.json'

    // Inline buildCheckpointCmd from C3
    function buildCheckpointCmd(stepName: string) {
      const RECOVERY_DIR = '.agents/.recovery'
      const SESSION_ID = Date.now().toString()
      return `mkdir -p ${RECOVERY_DIR} && ` +
        `echo '{"step": "${stepName}", "timestamp": "${new Date().toISOString()}"}' > ${RECOVERY_DIR}/${SESSION_ID}.json && ` +
        `cp ${RECOVERY_DIR}/${SESSION_ID}.json ${RECOVERY_DIR}/latest.json`
    }

    // Phase 0: Resume or Create
    let session: any
    if (fs.existsSync(AUTONOMOUS_SESSION_FILE)) {
      try {
        session = JSON.parse(fs.readFileSync(AUTONOMOUS_SESSION_FILE, 'utf8'))
      } catch {
        session = null
      }
    }
    
    if (!session) {
      session = {
        task: prompt,
        phase: 0,
        completedPhases: [],
        discoveries: [],
        startTime: new Date().toISOString()
      }
      fs.writeFileSync(AUTONOMOUS_SESSION_FILE, JSON.stringify(session, null, 2))
    }

    // Phase 1: PLAN
    if (session.phase === 0) {
      yield {
        toolName: 'think_deeply',
        input: {
          thought: `Decompose the following task into 3-10 sequential phases: ${prompt}\nEach phase should have an id, name, goal, verifyBy condition, and complexity (simple|complex|mega). Output your plan by calling write_file on ${PHASES_FILE}.`
        }
      }
      
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'ecc-planner',
            prompt: `Write the phased plan for: ${prompt}\nEnsure it follows the required JSON schema with id, name, goal, verifyBy, and complexity fields, and save it to ${PHASES_FILE}.`
          }]
        }
      }

      session.phase = 1
      fs.writeFileSync(AUTONOMOUS_SESSION_FILE, JSON.stringify(session, null, 2))
      
      yield {
        toolName: 'run_terminal_command',
        input: {
          command: buildCheckpointCmd('phase_1_planned')
        }
      }
    }

    // Phase 2: EXECUTE
    if (session.phase === 1) {
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'ecc-planner',
            prompt: `Execute the phases from ${PHASES_FILE}. For each phase:\n1. Spawn appropriate MetaBuff sub-pipeline (e.g., metabuff-mega for mega complexity, ecc-code-architect for simple).\n2. Verify completion (using metabuff-validator or running tests).\n3. Update ${AUTONOMOUS_SESSION_FILE} moving the phase to completedPhases.\n4. Log progress to .agents/.session-log.md.`
          }]
        }
      }
      
      session.phase = 2
      fs.writeFileSync(AUTONOMOUS_SESSION_FILE, JSON.stringify(session, null, 2))
      
      yield {
        toolName: 'run_terminal_command',
        input: {
          command: buildCheckpointCmd('phase_2_executed')
        }
      }
    }

    // Phase 3: VALIDATE
    if (session.phase === 2) {
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-validator',
            prompt: `Perform final validation for the fully completed task: ${prompt}\nEnsure everything is fully working according to the plan.`
          }]
        }
      }
      
      session.phase = 3
      fs.writeFileSync(AUTONOMOUS_SESSION_FILE, JSON.stringify(session, null, 2))
      
      yield {
        toolName: 'run_terminal_command',
        input: {
          command: buildCheckpointCmd('phase_3_validated')
        }
      }
    }

    // Phase 4: SUMMARY
    if (session.phase === 3) {
      yield {
        toolName: 'run_terminal_command',
        input: {
          command: `echo "=== METABUFF AUTONOMOUS SESSION COMPLETE ===" && cat .agents/.session-log.md || echo "Task complete."`
        }
      }
      
      session.phase = 4
      fs.writeFileSync(AUTONOMOUS_SESSION_FILE, JSON.stringify(session, null, 2))
    }
  }
}
