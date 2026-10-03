import { execSync } from 'child_process';

console.log("=================================================");
console.log("   TRICKTAKERS FULL TEST SUITE RUNNER           ");
console.log("=================================================\n");

const suites = [
    { name: "Phase 1: Core Engine", script: "testing/test_core_engine.ts" },
    { name: "Phase 2: Tier A Basic Characters", script: "testing/test_tier_a_characters.ts" },
    { name: "Phase 3: Tier B Advanced Characters", script: "testing/test_tier_b_characters.ts" },
    { name: "Phase 4: Tier C & D Special Characters", script: "testing/test_tier_cd_characters.ts" },
    { name: "Phase 5: Multi-Level AI Engine", script: "testing/test_ai_levels.ts" },
];

let totalPassed = 0;

for (const suite of suites) {
    console.log(`▶ Running [${suite.name}]...`);
    try {
        const output = execSync(`npx tsx ${suite.script}`, { encoding: 'utf-8' });
        console.log(output);
        totalPassed++;
    } catch (error: any) {
        console.error(`❌ FAILURE in ${suite.name}:`);
        console.error(error.stdout || error.message);
        process.exit(1);
    }
}

console.log("=================================================");
console.log(`🎉 ALL ${totalPassed}/${suites.length} TEST SUITES PASSED PERFECTLY!`);
console.log("=================================================");
