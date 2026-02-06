// Simple rule-based medication extraction (simulating medSpaCy/medExtractR logic)
const medicationDatabase = {
    'lamotrigine': { brand: 'Lamictal', class: 'Anticonvulsant' },
    'lamictal': { generic: 'Lamotrigine', class: 'Anticonvulsant' },
    'warfarin': { brand: 'Coumadin', class: 'Anticoagulant' },
    'metformin': { brand: 'Glucophage', class: 'Antidiabetic' },
    'tacrolimus': { brand: 'Prograf', class: 'Immunosuppressant' },
    'prograf': { generic: 'Tacrolimus', class: 'Immunosuppressant' },
    'lisinopril': { brand: 'Prinivil, Zestril', class: 'ACE Inhibitor' },
    'atorvastatin': { brand: 'Lipitor', class: 'Statin' }
};

function loadSampleNote() {
    const sampleNote = `MEDICATIONS:
Patient is currently taking Lamotrigine 200mg twice daily for seizure management.
Warfarin 5mg once daily at bedtime.
Metformin 500mg three times per day with meals.
Lisinopril 10mg once daily in the morning for hypertension.
Atorvastatin 20mg at bedtime for cholesterol management.`;
    
    document.getElementById('noteInput').value = sampleNote;
}

function extractMedications() {
    const noteText = document.getElementById('noteInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    
    if (!noteText.trim()) {
        resultsDiv.innerHTML = '<p style="color: #ef4444;">Please enter a clinical note first!</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<h2 style="color: #2563eb; margin-bottom: 1rem;">Extraction Results</h2>';
    
    let foundMedications = [];
    
    // Extract medications
    for (let med in medicationDatabase) {
        if (noteText.includes(med)) {
            // Extract strength (e.g., "200mg")
            const strengthPattern = new RegExp(`${med}\\s+(\\d+\\.?\\d*)\\s*(mg|g)`, 'i');
            const strengthMatch = noteText.match(strengthPattern);
            
            // Extract frequency
            const frequencyPatterns = [
                /twice\s+daily/i,
                /once\s+daily/i,
                /three\s+times\s+(?:per\s+)?day/i,
                /bid/i,
                /qd/i,
                /tid/i,
                /\d+x\/day/i
            ];
            
            let frequency = null;
            for (let pattern of frequencyPatterns) {
                const freqMatch = noteText.match(pattern);
                if (freqMatch) {
                    frequency = freqMatch[0];
                    break;
                }
            }
            
            // Extract intake time
            const intakePatterns = [
                /at\s+bedtime/i,
                /in\s+the\s+morning/i,
                /with\s+meals/i,
                /before\s+meals/i
            ];
            
            let intakeTime = null;
            for (let pattern of intakePatterns) {
                const timeMatch = noteText.match(pattern);
                if (timeMatch) {
                    intakeTime = timeMatch[0];
                    break;
                }
            }
            
            foundMedications.push({
                name: med.charAt(0).toUpperCase() + med.slice(1),
                strength: strengthMatch ? strengthMatch[1] + strengthMatch[2] : 'Not found',
                frequency: frequency ? frequency : 'Not found',
                intakeTime: intakeTime ? intakeTime : 'Not found',
                info: medicationDatabase[med]
            });
        }
    }
    
    if (foundMedications.length === 0) {
        resultsDiv.innerHTML += '<p style="color: #6b7280;">No medications found in the note. Try using medications from the sample note or common drugs like Lamotrigine, Warfarin, Metformin.</p>';
        return;
    }
    
    // Display results
    foundMedications.forEach((med, index) => {
        const card = `
            <div class="result-card">
                <h3>Medication ${index + 1}: ${med.name}</h3>
                <div class="entity">
                    <span class="entity-label">Drug Name:</span>
                    <span class="entity-value">${med.name}</span>
                </div>
                <div class="entity">
                    <span class="entity-label">Strength:</span>
                    <span class="entity-value">${med.strength}</span>
                </div>
                <div class="entity">
                    <span class="entity-label">Frequency:</span>
                    <span class="entity-value">${med.frequency}</span>
                </div>
                <div class="entity">
                    <span class="entity-label">Intake Time:</span>
                    <span class="entity-value">${med.intakeTime}</span>
                </div>
                <div class="entity">
                    <span class="entity-label">Drug Class:</span>
                    <span class="entity-value">${med.info.class}</span>
                </div>
                ${med.info.brand ? `
                <div class="entity">
                    <span class="entity-label">Brand Name:</span>
                    <span class="entity-value">${med.info.brand}</span>
                </div>
                ` : ''}
                ${med.info.generic ? `
                <div class="entity">
                    <span class="entity-label">Generic Name:</span>
                    <span class="entity-value">${med.info.generic}</span>
                </div>
                ` : ''}
            </div>
        `;
        resultsDiv.innerHTML += card;
    });
}
