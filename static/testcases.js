document.addEventListener('DOMContentLoaded', () => {
    const codeEl = document.getElementById('code');
    const langSel = document.getElementById('langSelect');
    const addTestBtn = document.getElementById('addTestBtn');
    const runAllTestsBtn = document.getElementById('runAllTestsBtn');
    const clearTestsBtn = document.getElementById('clearTestsBtn');
    const testCasesList = document.getElementById('testCasesList');
    const testResults = document.getElementById('testResults');
    const resultsSummary = document.getElementById('resultsSummary');

    let testCases = [];
    let testIdCounter = 0;

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add initial test case
    addTestCase();

    // Add test case
    if (addTestBtn) {
        addTestBtn.addEventListener('click', addTestCase);
    }

    function addTestCase() {
        const testId = testIdCounter++;
        const testCase = {
            id: testId,
            name: `Test Case ${testId + 1}`,
            input: '',
            expected: ''
        };
        
        testCases.push(testCase);
        renderTestCases();
    }

    function renderTestCases() {
        if (!testCasesList) return;

        if (testCases.length === 0) {
            testCasesList.innerHTML = '<div class="empty-state">No test cases. Click "Add Test" to create one.</div>';
            return;
        }

        testCasesList.innerHTML = testCases.map(test => `
            <div class="test-case-item" data-test-id="${test.id}">
                <div class="test-case-header">
                    <input type="text" class="test-case-name" value="${test.name}" 
                           onchange="updateTestName(${test.id}, this.value)">
                    <button class="test-case-remove" onclick="removeTest(${test.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="test-case-input">
                    <label>Input (optional)</label>
                    <input type="text" value="${test.input}" 
                           onchange="updateTestInput(${test.id}, this.value)"
                           placeholder="Input data for the test">
                </div>
                <div class="test-case-input">
                    <label>Expected Output</label>
                    <textarea onchange="updateTestExpected(${test.id}, this.value)"
                              placeholder="Expected output from your code">${test.expected}</textarea>
                </div>
            </div>
        `).join('');
    }

    // Global functions for inline handlers
    window.updateTestName = function(id, value) {
        const test = testCases.find(t => t.id === id);
        if (test) test.name = value;
    };

    window.updateTestInput = function(id, value) {
        const test = testCases.find(t => t.id === id);
        if (test) test.input = value;
    };

    window.updateTestExpected = function(id, value) {
        const test = testCases.find(t => t.id === id);
        if (test) test.expected = value;
    };

    window.removeTest = function(id) {
        testCases = testCases.filter(t => t.id !== id);
        renderTestCases();
    };

    // Clear all tests
    if (clearTestsBtn) {
        clearTestsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all test cases?')) {
                testCases = [];
                testIdCounter = 0;
                renderTestCases();
                clearResults();
            }
        });
    }

    // Run all tests
    if (runAllTestsBtn) {
        runAllTestsBtn.addEventListener('click', async () => {
            const code = (codeEl && codeEl.value || "").trim();
            const language = (langSel && langSel.value) || "python";

            if (!code) {
                showNotification('Please enter some code to test.', 'error');
                return;
            }

            if (testCases.length === 0) {
                showNotification('Please add at least one test case.', 'error');
                return;
            }

            // Validate test cases have expected output
            const invalidTests = testCases.filter(t => !t.expected || t.expected.trim() === '');
            if (invalidTests.length > 0) {
                showNotification('Please set expected output for all test cases.', 'error');
                return;
            }

            // Disable button and show loading
            runAllTestsBtn.disabled = true;
            runAllTestsBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Running...
            `;

            try {
                const res = await fetch("/run-tests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        code, 
                        language,
                        testCases: testCases.map(t => ({
                            name: t.name,
                            input: t.input,
                            expected: t.expected
                        }))
                    })
                });

                if (!res.ok) {
                    const text = await res.text();
                    showNotification(`Server error (${res.status})`, 'error');
                    return;
                }

                const data = await res.json();
                
                if (data.error) {
                    showNotification(`Error: ${data.error}`, 'error');
                    return;
                }

                displayResults(data.results);
                showNotification('Tests completed!', 'success');
                
            } catch (err) {
                console.error("Test error:", err);
                showNotification(`Error: ${err.message}`, 'error');
            } finally {
                // Re-enable button
                runAllTestsBtn.disabled = false;
                runAllTestsBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Run All Tests
                `;
            }
        });
    }

    function displayResults(results) {
        if (!testResults || !resultsSummary) return;

        const passed = results.filter(r => r.passed).length;
        const failed = results.length - passed;

        // Update summary
        resultsSummary.innerHTML = `
            <span class="summary-item">Total: <strong>${results.length}</strong></span>
            <span class="summary-item passed">Passed: <strong>${passed}</strong></span>
            <span class="summary-item failed">Failed: <strong>${failed}</strong></span>
        `;

        // Display results
        testResults.innerHTML = results.map(result => `
            <div class="test-result-item ${result.passed ? 'passed' : 'failed'}">
                <div class="result-header">
                    <div class="result-name">${result.name}</div>
                    <div class="result-status ${result.passed ? 'passed' : 'failed'}">
                        ${result.passed ? '✓ Passed' : '✗ Failed'}
                    </div>
                </div>
                <div class="result-details">
                    <div class="result-row">
                        <span class="result-label">Expected:</span>
                        <span class="result-value">${result.expected || '(empty)'}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Actual:</span>
                        <span class="result-value">${result.actual || '(empty)'}</span>
                    </div>
                    ${result.error ? `
                        <div class="result-error">
                            <strong>Error:</strong> ${result.error}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    function clearResults() {
        if (!testResults || !resultsSummary) return;

        resultsSummary.innerHTML = `
            <span class="summary-item">Total: <strong>0</strong></span>
            <span class="summary-item passed">Passed: <strong>0</strong></span>
            <span class="summary-item failed">Failed: <strong>0</strong></span>
        `;

        testResults.innerHTML = `
            <div class="empty-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <p>No test results yet</p>
                <span>Run tests to see results here</span>
            </div>
        `;
    }

    // Sample code based on language
    if (langSel && codeEl) {
        langSel.addEventListener('change', () => {
            const samples = {
                'python': `# Python Example: Calculator Functions
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b != 0:
        return a / b
    return "Error: Division by zero"

# Test the functions
print(add(10, 5))
print(subtract(10, 5))
print(multiply(10, 5))
print(divide(10, 5))`,
                'javascript': `// JavaScript Example: Calculator Functions
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b !== 0) {
        return a / b;
    }
    return "Error: Division by zero";
}

// Test the functions
console.log(add(10, 5));
console.log(subtract(10, 5));
console.log(multiply(10, 5));
console.log(divide(10, 2));`,
                'java': `// Java Example: Simple Calculator
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static int subtract(int a, int b) {
        return a - b;
    }
    
    public static int multiply(int a, int b) {
        return a * b;
    }
    
    public static double divide(int a, int b) {
        if (b != 0) {
            return (double) a / b;
        }
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(add(10, 5));
        System.out.println(subtract(10, 5));
        System.out.println(multiply(10, 5));
        System.out.println(divide(10, 2));
    }
}`,
                'cpp': `// C++ Example: Simple Calculator
#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int multiply(int a, int b) {
    return a * b;
}

double divide(int a, int b) {
    if (b != 0) {
        return (double)a / b;
    }
    return 0;
}

int main() {
    cout << add(10, 5) << endl;
    cout << subtract(10, 5) << endl;
    cout << multiply(10, 5) << endl;
    cout << divide(10, 2) << endl;
    return 0;
}`
            };

            const sampleTests = {
                'python': [
                    { 
                        name: 'Test All Functions', 
                        expected: `15
5
50
2.0` 
                    }
                ],
                'javascript': [
                    { 
                        name: 'Test All Functions', 
                        expected: `15
5
50
5` 
                    }
                ],
                'java': [
                    { 
                        name: 'Test All Functions', 
                        expected: `15
5
50
5.0` 
                    }
                ],
                'cpp': [
                    { 
                        name: 'Test All Functions', 
                        expected: `15
5
50
5` 
                    }
                ]
            };

            // Show notification about language change
            showNotification(`Language changed to ${langSel.value}`, 'info');
            
            // Automatically update code sample
            if (confirm(`Load ${langSel.value} sample code with test cases?`)) {
                codeEl.value = samples[langSel.value] || '';
                
                // Load sample test cases
                testCases = [];
                testIdCounter = 0;
                const langTests = sampleTests[langSel.value] || [];
                langTests.forEach(test => {
                    testCases.push({
                        id: testIdCounter++,
                        name: test.name,
                        input: '',
                        expected: test.expected
                    });
                });
                renderTestCases();
                showNotification('Sample code and test cases loaded!', 'success');
            }
        });

        // Set initial sample with test case
        if (!codeEl.value.trim()) {
            codeEl.value = `# Python Example: Calculator Functions
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b != 0:
        return a / b
    return "Error: Division by zero"

# Test the functions
print(add(10, 5))
print(subtract(10, 5))
print(multiply(10, 5))
print(divide(10, 5))`;
            
            // Load initial test case
            if (testCases.length === 0) {
                testCases.push({
                    id: testIdCounter++,
                    name: 'Test All Functions',
                    input: '',
                    expected: `15
5
50
2.0`
                });
                renderTestCases();
            }
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
