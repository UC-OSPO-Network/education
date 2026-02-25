import { getSheetData } from '../src/lib/getSheetData.js';

/**
 * Final Verification Script
 * Validates that all Learning Objectives meet the acceptance criteria
 */

async function verifyImplementation() {
    console.log('🔍 Running Final Verification...\n');

    const lessons = await getSheetData();
    console.log(`📊 Total Lessons: ${lessons.length}\n`);

    // Verification Criteria
    const results = {
        totalLessons: lessons.length,
        withLearningObjectives: 0,
        withoutLearningObjectives: 0,
        followsFormat: 0,
        hasBloomVerbs: 0,
        has3to5Outcomes: 0,
        lessonsMissingLOs: [],
        lessonsWithIssues: []
    };

    // Bloom's taxonomy verbs to check
    const bloomVerbs = [
        'explain', 'identify', 'describe', 'demonstrate', 'apply', 'recognize',
        'list', 'define', 'recall', 'understand', 'use', 'illustrate', 'classify',
        'analyze', 'compare', 'evaluate', 'create', 'design', 'synthesize', 'assess',
        'develop', 'formulate', 'construct', 'implement', 'configure', 'build'
    ];

    lessons.forEach(lesson => {
        const lo = lesson['Learning Objectives'] || '';
        const lessonName = lesson.name;

        // Check if has Learning Objectives
        if (lo && lo.trim() !== '') {
            results.withLearningObjectives++;

            // Check format: "After this lesson, the learner should be able to:"
            if (lo.includes('After this lesson') || lo.includes('after this lesson')) {
                results.followsFormat++;
            } else {
                results.lessonsWithIssues.push({
                    name: lessonName,
                    issue: 'Does not follow required format'
                });
            }

            // Check for Bloom's taxonomy verbs
            const hasBloomVerb = bloomVerbs.some(verb =>
                lo.toLowerCase().includes(verb.toLowerCase())
            );
            if (hasBloomVerb) {
                results.hasBloomVerbs++;
            } else {
                results.lessonsWithIssues.push({
                    name: lessonName,
                    issue: 'Missing Bloom\'s taxonomy verbs'
                });
            }

            // Check for 3-5 outcomes (count bullet points or line breaks)
            const bulletCount = (lo.match(/^-/gm) || []).length;
            const lineCount = lo.split('\n').filter(line => line.trim().startsWith('-')).length;
            const outcomeCount = Math.max(bulletCount, lineCount);

            if (outcomeCount >= 3 && outcomeCount <= 6) {
                results.has3to5Outcomes++;
            } else if (outcomeCount > 0) {
                results.lessonsWithIssues.push({
                    name: lessonName,
                    issue: `Has ${outcomeCount} outcomes (expected 3-5)`
                });
            }
        } else {
            results.withoutLearningObjectives++;
            results.lessonsMissingLOs.push(lessonName);
        }
    });

    // Calculate percentages
    const loCompletionRate = (results.withLearningObjectives / results.totalLessons * 100).toFixed(1);
    const formatComplianceRate = (results.followsFormat / results.withLearningObjectives * 100).toFixed(1);
    const bloomComplianceRate = (results.hasBloomVerbs / results.withLearningObjectives * 100).toFixed(1);
    const outcomeComplianceRate = (results.has3to5Outcomes / results.withLearningObjectives * 100).toFixed(1);

    // Display Results
    console.log('═══════════════════════════════════════════════════════');
    console.log('                 VERIFICATION RESULTS                  ');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📈 COMPLETION STATISTICS:');
    console.log(`   Total Lessons: ${results.totalLessons}`);
    console.log(`   ✅ With Learning Objectives: ${results.withLearningObjectives} (${loCompletionRate}%)`);
    console.log(`   ❌ Without Learning Objectives: ${results.withoutLearningObjectives}\n`);

    console.log('✓ QUALITY METRICS:');
    console.log(`   Format Compliance: ${results.followsFormat}/${results.withLearningObjectives} (${formatComplianceRate}%)`);
    console.log(`   Bloom's Taxonomy Usage: ${results.hasBloomVerbs}/${results.withLearningObjectives} (${bloomComplianceRate}%)`);
    console.log(`   Outcome Count (3-5): ${results.has3to5Outcomes}/${results.withLearningObjectives} (${outcomeComplianceRate}%)\n`);

    // Success Criteria Check
    console.log('🎯 SUCCESS CRITERIA:');
    const allCriteriaMet = [];

    const criterion1 = loCompletionRate >= 95;
    console.log(`   ${criterion1 ? '✅' : '❌'} Learning Objectives Completion ≥ 95%: ${loCompletionRate}%`);
    allCriteriaMet.push(criterion1);

    const criterion2 = formatComplianceRate >= 90;
    console.log(`   ${criterion2 ? '✅' : '❌'} Format Compliance ≥ 90%: ${formatComplianceRate}%`);
    allCriteriaMet.push(criterion2);

    const criterion3 = bloomComplianceRate >= 90;
    console.log(`   ${criterion3 ? '✅' : '❌'} Bloom's Taxonomy Usage ≥ 90%: ${bloomComplianceRate}%`);
    allCriteriaMet.push(criterion3);

    const criterion4 = outcomeComplianceRate >= 85;
    console.log(`   ${criterion4 ? '✅' : '❌'} Outcome Count Compliance ≥ 85%: ${outcomeComplianceRate}%\n`);
    allCriteriaMet.push(criterion4);

    // Issues Report
    if (results.lessonsMissingLOs.length > 0) {
        console.log('⚠️  LESSONS MISSING LEARNING OBJECTIVES:');
        results.lessonsMissingLOs.forEach(name => {
            console.log(`   - ${name}`);
        });
        console.log('');
    }

    if (results.lessonsWithIssues.length > 0) {
        console.log('⚠️  LESSONS WITH QUALITY ISSUES:');
        const uniqueIssues = {};
        results.lessonsWithIssues.forEach(item => {
            if (!uniqueIssues[item.name]) {
                uniqueIssues[item.name] = [];
            }
            uniqueIssues[item.name].push(item.issue);
        });

        Object.keys(uniqueIssues).forEach(name => {
            console.log(`   - ${name}:`);
            uniqueIssues[name].forEach(issue => {
                console.log(`     • ${issue}`);
            });
        });
        console.log('');
    }

    // Final Verdict
    console.log('═══════════════════════════════════════════════════════');
    if (allCriteriaMet.every(c => c)) {
        console.log('✅ ALL SUCCESS CRITERIA MET! Implementation Complete! 🎉');
    } else {
        console.log('⚠️  Some criteria not met. Review issues above.');
    }
    console.log('═══════════════════════════════════════════════════════\n');

    // Next Steps
    console.log('📋 NEXT STEPS:');
    if (results.withoutLearningObjectives === 0) {
        console.log('   1. ✅ All lessons have Learning Objectives');
    } else {
        console.log(`   1. ⚠️  Update ${results.withoutLearningObjectives} lessons with Learning Objectives`);
    }
    console.log('   2. Review the generated CSV file for Google Sheets import');
    console.log('   3. Follow google-sheets-update-instructions.md to update the sheet');
    console.log('   4. Comment on the GitHub issue with completion status\n');

    return allCriteriaMet.every(c => c);
}

// Run verification
verifyImplementation()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });
