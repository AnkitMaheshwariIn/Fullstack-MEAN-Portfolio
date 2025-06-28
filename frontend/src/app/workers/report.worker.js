self.onmessage = function(e) {
    const data = e.data;
    
    try {
        const result = processReportData(data);
        self.postMessage(result);
    } catch (error) {
        self.postMessage({
            success: false,
            timestamp: new Date().toISOString(),
            errors: [error.message]
        });
    }
};

// Process report data with business logic
function processReportData(data) {
    // Validate input data
    if (!data || !data.type) {
        throw new Error('Invalid report data format');
    }

    // Initialize result object
    const result = {
        success: true,
        timestamp: new Date().toISOString(),
        processedData: {
            summary: [],
            details: [],
            insights: []
        }
    };

    // Process based on report type
    switch (data.type) {
        case 'project':
            processProjectReport(data, result);
            break;
        case 'team':
            processTeamReport(data, result);
            break;
        case 'performance':
            processPerformanceReport(data, result);
            break;
        default:
            throw new Error(`Unsupported report type: ${data.type}`);
    }

    return result;
}

// Project-specific report processing
function processProjectReport(data, result) {
    // Calculate project metrics
    const totalHours = calculateTotalHours(data.metrics);
    const completionRate = calculateCompletionRate(data.metrics);
    const budgetAnalysis = analyzeBudget(data.metrics);

    // Add to summary
    result.processedData.summary.push(
        { name: 'Total Hours', value: totalHours, unit: 'hours', category: 'Project' },
        { name: 'Completion Rate', value: completionRate, unit: '%', category: 'Project' },
        { name: 'Budget Status', value: budgetAnalysis.status, unit: '%', category: 'Project' }
    );

    // Add insights
    result.processedData.insights.push(
        `Project ${data.title} is ${completionRate}% complete`,
        `Budget utilization: ${budgetAnalysis.status}%`,
        `Project duration: ${calculateDuration(data.startDate, data.endDate)} days`
    );
}

// Team-specific report processing
function processTeamReport(data, result) {
    // Calculate team metrics
    const teamPerformance = calculateTeamPerformance(data.metrics);
    const resourceUtilization = calculateResourceUtilization(data.metrics);
    const teamEfficiency = calculateTeamEfficiency(data.metrics);

    // Add to summary
    result.processedData.summary.push(
        { name: 'Team Performance', value: teamPerformance, unit: '%', category: 'Team' },
        { name: 'Resource Utilization', value: resourceUtilization, unit: '%', category: 'Team' },
        { name: 'Efficiency', value: teamEfficiency, unit: '%', category: 'Team' }
    );

    // Add insights
    result.processedData.insights.push(
        `Team performance score: ${teamPerformance}%`,
        `Resource utilization: ${resourceUtilization}%`,
        `Efficiency rating: ${teamEfficiency}%`
    );
}

// Performance report processing
function processPerformanceReport(data, result) {
    // Calculate performance metrics
    const performanceScore = calculatePerformanceScore(data.metrics);
    const productivity = calculateProductivity(data.metrics);
    const qualityIndex = calculateQualityIndex(data.metrics);

    // Add to summary
    result.processedData.summary.push(
        { name: 'Performance Score', value: performanceScore, unit: '%', category: 'Performance' },
        { name: 'Productivity', value: productivity, unit: '%', category: 'Performance' },
        { name: 'Quality Index', value: qualityIndex, unit: '%', category: 'Performance' }
    );

    // Add insights
    result.processedData.insights.push(
        `Overall performance: ${performanceScore}%`,
        `Productivity level: ${productivity}%`,
        `Quality index: ${qualityIndex}%`
    );
}

// Helper functions
function calculateTotalHours(metrics) {
    return metrics.reduce((total, metric) => 
        metric.name === 'hours' ? total + metric.value : total, 0
    );
}

function calculateCompletionRate(metrics) {
    const completedTasks = metrics.filter(m => m.name === 'completed_tasks').reduce((sum, m) => sum + m.value, 0);
    const totalTasks = metrics.filter(m => m.name === 'total_tasks').reduce((sum, m) => sum + m.value, 0);
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
}

function analyzeBudget(metrics) {
    const actualCost = metrics.find(m => m.name === 'actual_cost')?.value || 0;
    const budget = metrics.find(m => m.name === 'budget')?.value || 0;
    return {
        status: budget > 0 ? (actualCost / budget) * 100 : 0,
        variance: actualCost - budget
    };
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateTeamPerformance(metrics) {
    const performanceMetrics = metrics.filter(m => m.category === 'performance');
    return performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length;
}

function calculateResourceUtilization(metrics) {
    const utilizationMetrics = metrics.filter(m => m.category === 'utilization');
    return utilizationMetrics.reduce((sum, m) => sum + m.value, 0) / utilizationMetrics.length;
}

function calculateTeamEfficiency(metrics) {
    const efficiencyMetrics = metrics.filter(m => m.category === 'efficiency');
    return efficiencyMetrics.reduce((sum, m) => sum + m.value, 0) / efficiencyMetrics.length;
}

function calculatePerformanceScore(metrics) {
    const performanceMetrics = metrics.filter(m => m.category === 'performance');
    return performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length;
}

function calculateProductivity(metrics) {
    const productivityMetrics = metrics.filter(m => m.category === 'productivity');
    return productivityMetrics.reduce((sum, m) => sum + m.value, 0) / productivityMetrics.length;
}

function calculateQualityIndex(metrics) {
    const qualityMetrics = metrics.filter(m => m.category === 'quality');
    return qualityMetrics.reduce((sum, m) => sum + m.value, 0) / qualityMetrics.length;
}
