class AppreciationGenerator {
    constructor() {
        this.studentsData = new Map();
        this.bulletinData = null;
        // Token API intégré directement
        this.apiToken = 'cpk_c18912c80f4d4cba859873de4fd287f1.0458b7941c6450e19dc42ccce2acd5e5.99uFAEoImtmBNbDRfi7GY3lhpkXBwQTN';
        this.investmentCriteria = {
            positive: [
                "s'investit/participe en classe",
                "fait des efforts",
                "très sérieux",
                "motivé"
            ],
            negative: [
                "ne s'investit/ne participe pas en classe",
                "ne fait aucun effort",
                "comportement immature",
                "comportement inadapté"
            ]
        };
        this.initializeEventListeners();
        this.initializeNavigation();
        this.hideApiConfig();
    }

    initializeNavigation() {
        // Navigation entre les pages
        const pageMatiereBtn = document.getElementById('pageMatiere');
        const pageBulletinBtn = document.getElementById('pageBulletin');
        
        if (pageMatiereBtn) {
            pageMatiereBtn.addEventListener('click', () => {
                this.showPage('matiere');
            });
        }

        if (pageBulletinBtn) {
            pageBulletinBtn.addEventListener('click', () => {
                this.showPage('bulletin');
            });
        }
    }

    showPage(pageType) {
        // Masquer toutes les pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        // Désactiver tous les boutons de navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Afficher la page sélectionnée
        if (pageType === 'matiere') {
            const matiereContent = document.getElementById('matiereContent');
            const pageMatiere = document.getElementById('pageMatiere');
            
            if (matiereContent) {
                matiereContent.classList.add('active');
            }
            if (pageMatiere) {
                pageMatiere.classList.add('active');
            }
        } else if (pageType === 'bulletin') {
            const bulletinContent = document.getElementById('bulletinContent');
            const pageBulletin = document.getElementById('pageBulletin');
            
            if (bulletinContent) {
                bulletinContent.classList.add('active');
            }
            if (pageBulletin) {
                pageBulletin.classList.add('active');
            }
        }
    }

    initializeEventListeners() {
        // Upload des fichiers pour les appréciations matière
        ['trimestre1', 'trimestre2', 'trimestre3'].forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.handleFileUpload(e, index + 1);
                });
            }
        });

        // Zone de texte pour le bulletin
        const bulletinTextArea = document.getElementById('bulletinTextArea');
        if (bulletinTextArea) {
            bulletinTextArea.addEventListener('input', () => {
                this.handleBulletinTextChange();
            });

            bulletinTextArea.addEventListener('paste', (e) => {
                // Petite pause pour laisser le contenu se coller
                setTimeout(() => {
                    this.handleBulletinTextChange();
                }, 100);
            });
        }

        // Bouton de collage depuis le presse-papiers
        const pasteBtn = document.getElementById('pasteFromClipboardBtn');
        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => {
                this.pasteFromClipboard();
            });
        }

        // Bouton d'analyse pour les appréciations matière
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.showInvestmentSelection();
            });
        }

        // Bouton de génération de bulletin
        const generateBulletinBtn = document.getElementById('generateBulletinBtn');
        if (generateBulletinBtn) {
            generateBulletinBtn.addEventListener('click', () => {
                this.generateBulletin();
            });
        }

        // Bouton d'effacement du bulletin
        const clearBulletinBtn = document.getElementById('clearBulletinBtn');
        if (clearBulletinBtn) {
            clearBulletinBtn.addEventListener('click', () => {
                this.clearBulletin();
            });
        }

        // Boutons d'export pour les appréciations matière
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportResults();
            });
        }

        const copyAllBtn = document.getElementById('copyAllBtn');
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', () => {
                this.copyAllResults();
            });
        }

        // Boutons pour le bulletin
        const copyBulletinBtn = document.getElementById('copyBulletinBtn');
        if (copyBulletinBtn) {
            copyBulletinBtn.addEventListener('click', () => {
                this.copyBulletin();
            });
        }

        const copyAppreciationBtn = document.getElementById('copyAppreciationBtn');
        if (copyAppreciationBtn) {
            copyAppreciationBtn.addEventListener('click', () => {
                this.copyGeneralAppreciation();
            });
        }
    }

    hideApiConfig() {
        // Masquer la section de configuration API
        const configSection = document.querySelector('.config-section');
        if (configSection) {
            configSection.style.display = 'none';
        }
    }

    async handleFileUpload(event, trimestre) {
        const file = event.target.files[0];
        const statusElement = document.getElementById(`status${trimestre}`);
        
        if (!file) {
            statusElement.textContent = '';
            statusElement.className = 'file-status';
            return;
        }

        try {
            const csvText = await this.readFile(file);
            const students = this.parseCSV(csvText, trimestre);
            
            // Fusionner avec les données existantes
            students.forEach(student => {
                const key = `${student.nom}_${student.prenom}`;
                if (!this.studentsData.has(key)) {
                    this.studentsData.set(key, {
                        nom: student.nom,
                        prenom: student.prenom,
                        trimestres: {},
                        investment: []
                    });
                }
                this.studentsData.get(key).trimestres[trimestre] = student.notes;
            });

            statusElement.textContent = `✓ ${students.length} élèves importés`;
            statusElement.className = 'file-status success';
            
        } catch (error) {
            statusElement.textContent = `✗ Erreur: ${error.message}`;
            statusElement.className = 'file-status error';
        }

        this.enableAnalyzeButton();
    }

    enableAnalyzeButton() {
        const hasData = this.studentsData.size > 0;
        const button = document.getElementById('analyzeBtn');
        button.disabled = !hasData;
        
        if (hasData) {
            button.innerHTML = '<span class="btn-icon">👥</span>Définir l\'investissement des élèves';
        }
    }

    showInvestmentSelection() {
        // Masquer les autres sections
        document.querySelector('.upload-section').style.display = 'none';
        document.querySelector('.analysis-section').style.display = 'none';
        
        // Créer ou afficher la section d'investissement
        let investmentSection = document.getElementById('investmentSection');
        if (!investmentSection) {
            investmentSection = this.createInvestmentSection();
            document.querySelector('main').appendChild(investmentSection);
        }
        
        investmentSection.style.display = 'block';
        this.populateInvestmentSection();
    }

    createInvestmentSection() {
        const section = document.createElement('section');
        section.id = 'investmentSection';
        section.className = 'investment-section';
        section.innerHTML = `
            <h2>Investissement et Comportement des Élèves</h2>
            <p class="investment-instructions">
                Sélectionnez les critères d'investissement pour chaque élève. Ces informations seront intégrées dans les appréciations.
            </p>
            <div id="studentsInvestmentList" class="students-investment-list"></div>
            <div class="investment-controls">
                <button id="generateAppreciationsBtn" class="generate-btn">
                    <span class="btn-icon">🤖</span>
                    Générer les Appréciations
                </button>
                <button id="backToUploadBtn" class="back-btn">
                    <span class="btn-icon">⬅️</span>
                    Retour à l'import
                </button>
            </div>
        `;
        
        // Ajouter les event listeners après insertion dans le DOM
        setTimeout(() => {
            const generateBtn = document.getElementById('generateAppreciationsBtn');
            const backBtn = document.getElementById('backToUploadBtn');
            
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    console.log('Bouton générer cliqué');
                    this.collectInvestmentData();
                    this.generateAppreciations();
                });
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    console.log('Bouton retour cliqué');
                    this.backToUpload();
                });
            }
        }, 100);
        
        return section;
    }

    populateInvestmentSection() {
        const container = document.getElementById('studentsInvestmentList');
        container.innerHTML = '';
        
        for (const [key, studentData] of this.studentsData) {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student-investment-card';
            studentDiv.innerHTML = `
                <div class="student-investment-header">
                    <h3>${studentData.prenom} ${studentData.nom}</h3>
                    <div class="student-average-preview">
                        Moy: ${this.getStudentAverage(studentData)}/20
                    </div>
                </div>
                <div class="investment-criteria">
                    <div class="criteria-group positive">
                        <h4>Critères positifs :</h4>
                        ${this.investmentCriteria.positive.map(criterion => `
                            <label class="criterion-label">
                                <input type="checkbox" name="investment_${key}" value="${criterion}">
                                <span class="criterion-text">${criterion}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="criteria-group negative">
                        <h4>Critères à améliorer :</h4>
                        ${this.investmentCriteria.negative.map(criterion => `
                            <label class="criterion-label">
                                <input type="checkbox" name="investment_${key}" value="${criterion}">
                                <span class="criterion-text">${criterion}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            container.appendChild(studentDiv);
        }
    }

    getStudentAverage(studentData) {
        const trimestres = Object.keys(studentData.trimestres);
        if (trimestres.length === 0) return 'N/A';
        
        const dernierTrimestre = trimestres.sort().pop();
        const notes = studentData.trimestres[dernierTrimestre];
        const moyenne = this.calculateWeightedAverage(notes);
        
        return moyenne ? moyenne.toFixed(1) : 'N/A';
    }

    collectInvestmentData() {
        console.log('Collecte des données d\'investissement');
        
        for (const [key, studentData] of this.studentsData) {
            const checkboxes = document.querySelectorAll(`input[name="investment_${key}"]:checked`);
            studentData.investment = Array.from(checkboxes).map(cb => cb.value);
            console.log(`${studentData.prenom} ${studentData.nom}: ${studentData.investment.length} critères sélectionnés`);
        }
        
        console.log('Collecte terminée');
    }

    backToUpload() {
        const investmentSection = document.getElementById('investmentSection');
        if (investmentSection) {
            investmentSection.style.display = 'none';
        }
        document.querySelector('.upload-section').style.display = 'block';
        document.querySelector('.analysis-section').style.display = 'block';
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    parseCSV(csvText, trimestre) {
        const lines = csvText.trim().split('\n');
        const students = [];

        if (lines.length < 3) {
            throw new Error('Format de fichier invalide');
        }

        // Détecter le format du fichier
        const isPhysiqueChimieFormat = lines[1].includes('élèves') && lines[1].includes('Moyenne');
        
        if (isPhysiqueChimieFormat) {
            return this.parsePhysiqueChimieFormat(lines, trimestre);
        } else {
            return this.parseStandardFormat(lines, trimestre);
        }
    }

    parsePhysiqueChimieFormat(lines, trimestre) {
        const students = [];
        
        // Ligne 2 contient les coefficients
        const coeffLine = lines[1];
        const coeffParts = this.parseCSVLine(coeffLine);
        
        // Extraire les coefficients (ignorer les 2 premières colonnes: nom et moyenne)
        const coefficients = [];
        for (let i = 2; i < coeffParts.length; i++) {
            const coeff = coeffParts[i].trim();
            if (coeff && !isNaN(parseInt(coeff))) {
                coefficients.push(parseInt(coeff));
            } else if (coeff.includes('/')) {
                // Format "2-/6" -> prendre le premier chiffre
                const match = coeff.match(/(\d+)/);
                if (match) {
                    coefficients.push(parseInt(match[1]));
                }
            }
        }

        // Parser les données des élèves (à partir de la ligne 3)
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.includes('Moy. de la classe')) continue;

            try {
                const parts = this.parseCSVLine(line);
                if (parts.length < 3) continue;

                const fullName = parts[0].replace(/"/g, '').trim();
                if (!fullName) continue;

                // Séparer nom et prénom
                const nameParts = fullName.split(' ');
                const nom = nameParts[0];
                const prenom = nameParts.slice(1).join(' ');

                const notes = [];

                // Parser les notes (ignorer la moyenne en colonne 2)
                for (let j = 2; j < parts.length && j - 2 < coefficients.length; j++) {
                    const notePart = parts[j].replace(/"/g, '').trim();
                    if (!notePart || notePart === 'Abs' || notePart === '' || notePart === 'N.Rdu') continue;

                    // Convertir virgule en point pour les décimales
                    const noteStr = notePart.replace(',', '.');
                    const note = parseFloat(noteStr);
                    const coeff = coefficients[j - 2] || 1;

                    if (!isNaN(note) && note >= 0 && note <= 20) {
                        notes.push({ note, coeff });
                    }
                }

                if (nom && prenom && notes.length > 0) {
                    students.push({ nom, prenom, notes });
                }
            } catch (error) {
                console.warn(`Erreur ligne ${i + 1}: ${error.message}`);
            }
        }

        if (students.length === 0) {
            throw new Error('Aucun élève valide trouvé dans le fichier');
        }

        return students;
    }

    parseStandardFormat(lines, trimestre) {
        const students = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                const parts = this.parseCSVLine(line);
                if (parts.length < 3) continue;

                const nom = parts[0].trim();
                const prenom = parts[1].trim();
                const notes = [];

                // Parser les notes avec coefficients
                for (let j = 2; j < parts.length; j++) {
                    const notePart = parts[j].trim();
                    if (!notePart) continue;

                    const match = notePart.match(/^(\d+(?:\.\d+)?)\((\d+)\)$/);
                    if (match) {
                        const note = parseFloat(match[1]);
                        const coeff = parseInt(match[2]);
                        if (!isNaN(note) && !isNaN(coeff) && note >= 0 && note <= 20) {
                            notes.push({ note, coeff });
                        }
                    }
                }

                if (nom && prenom && notes.length > 0) {
                    students.push({ nom, prenom, notes });
                }
            } catch (error) {
                console.warn(`Erreur ligne ${i + 1}: ${error.message}`);
            }
        }

        if (students.length === 0) {
            throw new Error('Aucun élève valide trouvé dans le fichier');
        }

        return students;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if ((char === ',' || char === ';') && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    async generateAppreciations() {
        console.log('Début de generateAppreciations');
        
        try {
            // Masquer la section d'investissement
            const investmentSection = document.getElementById('investmentSection');
            if (investmentSection) {
                investmentSection.style.display = 'none';
            }
            
            // Créer et afficher l'indicateur de progression
            const progressIndicator = this.createProgressIndicator();
            document.querySelector('main').appendChild(progressIndicator);
            
            const resultsSection = document.getElementById('resultsSection');
            const resultsContainer = document.getElementById('resultsContainer');

            console.log('Éléments DOM trouvés:', {
                progressIndicator: !!progressIndicator,
                resultsSection: !!resultsSection,
                resultsContainer: !!resultsContainer
            });

            if (resultsSection) {
                resultsSection.style.display = 'none';
            }
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
            }

            console.log('Nombre d\'élèves à traiter:', this.studentsData.size);

            const results = [];
            const totalStudents = this.studentsData.size;
            let currentIndex = 0;

            // Initialisation
            this.updateProgressDisplay(progressIndicator, 'Initialisation...', 0, totalStudents);

            for (const [key, studentData] of this.studentsData) {
                currentIndex++;
                const studentName = `${studentData.prenom} ${studentData.nom}`;
                
                // Mettre à jour l'affichage du progrès
                this.updateProgressDisplay(progressIndicator, `Traitement de ${studentName}...`, currentIndex - 1, totalStudents);
                
                console.log(`Traitement de ${studentName}`);
                
                try {
                    const analysis = this.analyzeStudent(studentData);
                    console.log('Analyse terminée pour', studentData.prenom);
                    
                    // Mettre à jour pour l'étape IA
                    this.updateProgressDisplay(progressIndicator, `Génération IA pour ${studentName}...`, currentIndex - 0.5, totalStudents);
                    
                    const appreciation = await this.generateAppreciationWithAI(studentData, analysis);
                    console.log('Appréciation générée pour', studentData.prenom);
                    
                    results.push({
                        ...studentData,
                        analysis,
                        appreciation
                    });

                    // Affichage progressif
                    this.displayStudentResult(studentData, analysis, appreciation);
                    
                    // Mettre à jour le progrès final pour cet élève
                    this.updateProgressDisplay(progressIndicator, `${studentName} terminé`, currentIndex, totalStudents);
                    
                    // Petite pause pour voir le progrès
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (error) {
                    console.error(`Erreur pour ${studentData.nom} ${studentData.prenom}:`, error);
                    
                    const analysis = this.analyzeStudent(studentData);
                    const appreciation = this.generateFallbackAppreciation(studentData, analysis);
                    
                    results.push({
                        ...studentData,
                        analysis,
                        appreciation
                    });
                    
                    this.displayStudentResult(studentData, analysis, appreciation);
                    
                    // Mettre à jour même en cas d'erreur
                    this.updateProgressDisplay(progressIndicator, `${studentName} (erreur)`, currentIndex, totalStudents);
                }
            }

            console.log('Traitement terminé, affichage des résultats');
            
            // Affichage final
            this.updateProgressDisplay(progressIndicator, 'Finalisation...', totalStudents, totalStudents);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Supprimer l'indicateur de progression
            if (progressIndicator && progressIndicator.parentNode) {
                progressIndicator.parentNode.removeChild(progressIndicator);
            }
            
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Erreur dans generateAppreciations:', error);
            alert('Une erreur est survenue lors de la génération des appréciations. Consultez la console pour plus de détails.');
        }
    }

    createProgressIndicator() {
        const progressSection = document.createElement('section');
        progressSection.id = 'progressSection';
        progressSection.className = 'progress-section';
        progressSection.innerHTML = `
            <h2>🤖 Génération des Appréciations en Cours</h2>
            <div id="progressDisplay" class="progress-display">
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        <div class="progress-message">Initialisation...</div>
                        <div class="progress-counter">0/0 élèves (0%)</div>
                    </div>
                    <div class="spinner"></div>
                </div>
            </div>
        `;
        return progressSection;
    }

    updateProgressDisplay(progressIndicator, message, current, total) {
        if (!progressIndicator) {
            console.log('Pas d\'indicateur de progression');
            return;
        }
        
        const percentage = Math.round((current / total) * 100);
        const progressFill = progressIndicator.querySelector('.progress-fill');
        const progressMessage = progressIndicator.querySelector('.progress-message');
        const progressCounter = progressIndicator.querySelector('.progress-counter');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressMessage) {
            progressMessage.textContent = message;
        }
        if (progressCounter) {
            progressCounter.textContent = `${Math.floor(current)}/${total} élèves (${percentage}%)`;
        }
        
        console.log(`Progression: ${message} - ${percentage}%`);
    }

    analyzeStudent(studentData) {
        const analysis = {
            trimestres: {},
            evolution: '',
            pointsForts: [],
            pointsFaibles: []
        };

        // Analyser chaque trimestre
        Object.keys(studentData.trimestres).forEach(trimestre => {
            const notes = studentData.trimestres[trimestre];
            const devoirsSurTable = notes.filter(n => n.coeff > 1);

            const moyenneDevoirs = this.calculateWeightedAverage(devoirsSurTable);
            const moyenneGenerale = this.calculateWeightedAverage(notes);

            analysis.trimestres[trimestre] = {
                moyenneDevoirs,
                moyenneGenerale,
                nbDevoirs: devoirsSurTable.length
            };
        });

        // Analyser l'évolution
        const trimestresOrdonnes = Object.keys(analysis.trimestres).sort();
        if (trimestresOrdonnes.length > 1) {
            const premier = analysis.trimestres[trimestresOrdonnes[0]];
            const dernier = analysis.trimestres[trimestresOrdonnes[trimestresOrdonnes.length - 1]];
            
            const evolutionGenerale = dernier.moyenneGenerale - premier.moyenneGenerale;

            if (evolutionGenerale > 1) {
                analysis.evolution = 'progression';
            } else if (evolutionGenerale < -1) {
                analysis.evolution = 'régression';
            } else {
                analysis.evolution = 'stable';
            }
        }

        // Identifier points forts et faibles
        const dernierTrimestre = analysis.trimestres[trimestresOrdonnes[trimestresOrdonnes.length - 1]];
        if (dernierTrimestre) {
            if (dernierTrimestre.moyenneDevoirs >= 14) {
                analysis.pointsForts.push('excellents résultats aux évaluations');
            } else if (dernierTrimestre.moyenneDevoirs >= 12) {
                analysis.pointsForts.push('bons résultats aux évaluations');
            }

            if (dernierTrimestre.moyenneDevoirs < 10) {
                analysis.pointsFaibles.push('difficultés aux évaluations');
            }
        }

        return analysis;
    }

    calculateWeightedAverage(notes) {
        if (notes.length === 0) return null;
        
        const totalPoints = notes.reduce((sum, n) => sum + (n.note * n.coeff), 0);
        const totalCoeff = notes.reduce((sum, n) => sum + n.coeff, 0);
        
        return Math.round((totalPoints / totalCoeff) * 100) / 100;
    }

    async generateAppreciationWithAI(studentData, analysis) {
        const prompt = this.buildPrompt(studentData, analysis);
        
        try {
            const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "deepseek-ai/DeepSeek-V3-0324",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    stream: false,
                    max_tokens: 100,
                    temperature: 0.6
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const data = await response.json();
            let appreciation = data.choices[0].message.content.trim();
            
            // Nettoyer l'appréciation (supprimer guillemets, préfixes, etc.)
            appreciation = appreciation.replace(/^["']|["']$/g, '');
            
            // Supprimer les préfixes indésirables
            appreciation = appreciation.replace(/^(Appréciation\s*:?\s*|Appréciation pour.*?:?\s*)/i, '');
            
            // Supprimer les informations de caractères
            appreciation = appreciation.replace(/\s*\(\d+\s*caractères?\)\.?$/i, '');
            
            // Nettoyer les espaces multiples
            appreciation = appreciation.replace(/\s+/g, ' ').trim();
            
            return appreciation;
            
        } catch (error) {
            console.error('Erreur API Chutes.AI:', error);
            return this.generateFallbackAppreciation(studentData, analysis);
        }
    }

    buildPrompt(studentData, analysis) {
        const trimestres = Object.keys(analysis.trimestres).sort();
        const dernierTrimestre = analysis.trimestres[trimestres[trimestres.length - 1]];
        const numeroTrimestre = Math.max(...trimestres.map(t => parseInt(t)));
        
        let prompt = `Tu es un professeur expérimenté. Rédige une appréciation scolaire concise et complète pour ${studentData.prenom} ${studentData.nom}.\n\n`;
        
        prompt += `Données académiques:\n`;
        trimestres.forEach(t => {
            const data = analysis.trimestres[t];
            prompt += `- Trimestre ${t}: Moyenne devoirs ${data.moyenneDevoirs?.toFixed(1) || 'N/A'}/20\n`;
        });
        
        if (analysis.evolution) {
            prompt += `- Évolution: ${analysis.evolution}\n`;
        }

        // Ajouter les critères d'investissement
        if (studentData.investment && studentData.investment.length > 0) {
            prompt += `\nComportement et investissement:\n`;
            studentData.investment.forEach(criterion => {
                prompt += `- ${criterion}\n`;
            });
        }
        
        // Adapter les conseils selon le trimestre
        let conseilsSpecifiques = '';
        if (numeroTrimestre === 3) {
            conseilsSpecifiques = `
- C'est le trimestre 3 (fin d'année), ne demande PAS de progresser ou de continuer les efforts
- Fais un bilan de l'année scolaire
- Pour les bons résultats : félicite et encourage pour la suite
- Pour les difficultés : mentionne les acquis et donne des perspectives positives`;
        } else {
            conseilsSpecifiques = `
- C'est le trimestre ${numeroTrimestre}, tu peux encourager la progression et donner des conseils pour la suite
- Donne des conseils constructifs pour améliorer les résultats`;
        }
        
        prompt += `\nRédige une appréciation professionnelle qui :
- Mentionne les résultats aux devoirs sur table en priorité
- Intègre le comportement/investissement si pertinent${conseilsSpecifiques}
- Reste concise (environ 150-200 caractères)
- Ne mentionne jamais les TP
- Utilise un ton professionnel et bienveillant
Ne fais jamais apparaitre **, ou Appréciation pour ou appréciation

Écris directement l'appréciation sans introduction ni explication.`;
        
        return prompt;
    }

    generateFallbackAppreciation(studentData, analysis) {
        const trimestres = Object.keys(analysis.trimestres).sort();
        const dernierTrimestre = analysis.trimestres[trimestres[trimestres.length - 1]];
        const numeroTrimestre = Math.max(...trimestres.map(t => parseInt(t)));
        
        if (!dernierTrimestre) {
            return "Données insuffisantes pour générer une appréciation.";
        }

        let appreciation = "";
        const moyenneDevoirs = dernierTrimestre.moyenneDevoirs;

        // Résultats académiques
        if (moyenneDevoirs >= 16) {
            appreciation = "Excellents résultats aux évaluations";
        } else if (moyenneDevoirs >= 14) {
            appreciation = "Très bons résultats aux évaluations";
        } else if (moyenneDevoirs >= 12) {
            appreciation = "Bons résultats aux évaluations";
        } else if (moyenneDevoirs >= 10) {
            appreciation = "Résultats satisfaisants aux évaluations";
        } else {
            appreciation = "Difficultés aux évaluations";
        }

        // Comportement (concis)
        if (studentData.investment && studentData.investment.length > 0) {
            const positiveInvestment = studentData.investment.filter(inv => 
                this.investmentCriteria.positive.includes(inv)
            );
            const negativeInvestment = studentData.investment.filter(inv => 
                this.investmentCriteria.negative.includes(inv)
            );

            if (positiveInvestment.length > 0) {
                if (positiveInvestment[0].includes("s'investit")) {
                    appreciation += ", bon investissement";
                } else if (positiveInvestment[0].includes("efforts")) {
                    appreciation += ", fait des efforts";
                } else if (positiveInvestment[0].includes("sérieux")) {
                    appreciation += ", très sérieux";
                } else if (positiveInvestment[0].includes("motivé")) {
                    appreciation += ", motivé";
                }
            }
            if (negativeInvestment.length > 0) {
                if (negativeInvestment[0].includes("ne s'investit")) {
                    appreciation += ", manque d'investissement";
                } else if (negativeInvestment[0].includes("aucun effort")) {
                    appreciation += ", aucun effort";
                } else if (negativeInvestment[0].includes("immature")) {
                    appreciation += ", comportement immature";
                } else if (negativeInvestment[0].includes("inadapté")) {
                    appreciation += ", comportement inadapté";
                }
            }
        }

        // Évolution et conseil adaptés au trimestre
        if (numeroTrimestre === 3) {
            // Trimestre 3 : bilan de fin d'année
            if (analysis.evolution === 'progression') {
                appreciation += ". Belle progression cette année.";
            } else if (analysis.evolution === 'régression') {
                appreciation += ". Année difficile mais des acquis à valoriser.";
            } else {
                if (moyenneDevoirs >= 12) {
                    appreciation += ". Année réussie, félicitations.";
                } else {
                    appreciation += ". Année avec des difficultés mais du potentiel.";
                }
            }
        } else {
            // Trimestres 1 et 2 : conseils pour progresser
            if (analysis.evolution === 'progression') {
                appreciation += ". Progression encourageante, continuez ainsi.";
            } else if (analysis.evolution === 'régression') {
                appreciation += ". Baisse de niveau, des efforts sont nécessaires.";
            } else {
                if (moyenneDevoirs >= 12) {
                    appreciation += ". Continuez vos efforts.";
                } else {
                    appreciation += ". Plus de travail nécessaire.";
                }
            }
        }

        return appreciation;
    }

    displayStudentResult(studentData, analysis, appreciation) {
        const container = document.getElementById('resultsContainer');
        const trimestres = Object.keys(analysis.trimestres).sort();
        const dernierTrimestre = analysis.trimestres[trimestres[trimestres.length - 1]];
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'student-result';
        
        const investmentText = studentData.investment && studentData.investment.length > 0 
            ? studentData.investment.join(', ') 
            : 'Aucun critère sélectionné';
        
        resultDiv.innerHTML = `
            <div class="student-header">
                <div class="student-name">${studentData.prenom} ${studentData.nom}</div>
                <div class="student-average">Moy: ${dernierTrimestre?.moyenneGenerale?.toFixed(1) || 'N/A'}/20</div>
            </div>
            <div class="appreciation-container">
                <div class="appreciation-text">${appreciation}</div>
                <button class="copy-individual-btn" data-student-name="${studentData.prenom} ${studentData.nom}" data-appreciation="${appreciation.replace(/"/g, '&quot;')}">
                    <span class="copy-icon">📋</span>
                </button>
            </div>
            <div class="notes-summary">
                <strong>Résumé:</strong> 
                ${trimestres.map(t => {
                    const data = analysis.trimestres[t];
                    return `T${t}: Devoirs ${data.moyenneDevoirs?.toFixed(1) || 'N/A'}/20`;
                }).join(' | ')}
                ${analysis.evolution ? ` | Évolution: ${analysis.evolution}` : ''}
                <br><strong>Investissement:</strong> ${investmentText}
            </div>
        `;
        
        // Ajouter l'event listener après insertion dans le DOM
        const copyBtn = resultDiv.querySelector('.copy-individual-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const appreciation = this.getAttribute('data-appreciation').replace(/&quot;/g, '"');
                copyIndividualAppreciation(this, appreciation);
            });
        }
        
        container.appendChild(resultDiv);
    }

    exportResults() {
        const results = [];
        const studentResults = document.querySelectorAll('.student-result');
        
        studentResults.forEach(result => {
            const name = result.querySelector('.student-name').textContent;
            const appreciation = result.querySelector('.appreciation-text').textContent;
            const summary = result.querySelector('.notes-summary').textContent;
            
            results.push([name, appreciation, summary]);
        });

        const csvContent = 'Élève,Appréciation,Résumé\n' + 
            results.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `appreciations_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    copyAllResults() {
        const results = [];
        const studentResults = document.querySelectorAll('.student-result');
        
        studentResults.forEach(result => {
            const name = result.querySelector('.student-name').textContent;
            const appreciation = result.querySelector('.appreciation-text').textContent;
            results.push(`${name}: ${appreciation}`);
        });

        const text = results.join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            const button = document.getElementById('copyAllBtn');
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="btn-icon">✓</span>Copié !';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        });
    }

    async handleBulletinTextChange() {
        const bulletinTextArea = document.getElementById('bulletinTextArea');
        const statusElement = document.getElementById('bulletinStatus');
        
        if (!bulletinTextArea || !statusElement) {
            console.warn('Éléments bulletin non trouvés');
            return;
        }
        
        const bulletinText = bulletinTextArea.value.trim();
        
        if (bulletinText.length > 0) {
            try {
                this.bulletinData = this.parseBulletinText(bulletinText);
                statusElement.textContent = `✓ Bulletin importé (${this.bulletinData.subjects.length} matières)`;
                statusElement.className = 'file-status success';
                this.enableBulletinButton(true);
            } catch (error) {
                statusElement.textContent = `✗ Erreur: ${error.message}`;
                statusElement.className = 'file-status error';
                this.enableBulletinButton(false);
            }
        } else {
            this.bulletinData = null;
            statusElement.textContent = '';
            statusElement.className = 'file-status';
            this.enableBulletinButton(false);
        }
    }

    enableBulletinButton(enabled) {
        const button = document.getElementById('generateBulletinBtn');
        if (!button) {
            console.warn('Bouton generateBulletinBtn non trouvé');
            return;
        }
        
        button.disabled = !enabled;
        
        if (enabled) {
            button.innerHTML = '<span class="btn-icon">🤖</span>Générer le Bulletin';
        }
    }

    parseBulletinText(bulletinText) {
        const subjects = [];
        const lines = bulletinText.split('\n').map(line => line.trim()).filter(line => line);
        
        // Parser le format ligne par ligne (8 lignes par matière)
        for (let i = 0; i < lines.length; i += 8) {
            if (i + 7 < lines.length) {
                const subject = {
                    name: lines[i] || '',
                    teacher: lines[i + 1] || '',
                    studentGrade: this.parseGrade(lines[i + 2]),
                    classAverage: this.parseGrade(lines[i + 3]),
                    minGrade: this.parseGrade(lines[i + 4]),
                    maxGrade: this.parseGrade(lines[i + 5]),
                    hours: lines[i + 6] || '',
                    appreciation: lines[i + 7] || ''
                };

                if (subject.name && subject.name.trim()) {
                    subjects.push(subject);
                }
            }
        }

        // Si le format 8 lignes ne fonctionne pas, essayer le format CSV
        if (subjects.length === 0) {
            return this.parseBulletinCSV(bulletinText);
        }

        if (subjects.length === 0) {
            throw new Error('Aucune matière valide trouvée dans le texte');
        }

        // Calculer la moyenne générale
        const validGrades = subjects
            .map(s => s.studentGrade)
            .filter(grade => grade !== null && !isNaN(grade));
        
        const generalAverage = validGrades.length > 0 
            ? (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(2)
            : 'N/A';

        return {
            studentName: 'Élève',
            period: 'Trimestre',
            subjects,
            generalAverage,
            totalSubjects: subjects.length
        };
    }

    parseBulletinCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const subjects = [];

        // Détecter le format et parser
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = this.parseCSVLine(line);
            
            // Ignorer les en-têtes
            if (parts[0] && (parts[0].toLowerCase().includes('matière') || parts[0].toLowerCase().includes('matiere'))) {
                continue;
            }

            // Extraire les données de matière
            if (parts.length >= 7) {
                const subject = {
                    name: parts[0] || '',
                    teacher: parts[1] || '',
                    studentGrade: this.parseGrade(parts[2]),
                    classAverage: this.parseGrade(parts[3]),
                    minGrade: this.parseGrade(parts[4]),
                    maxGrade: this.parseGrade(parts[5]),
                    hours: parts[6] || '',
                    appreciation: parts[7] || ''
                };

                if (subject.name && subject.name.trim()) {
                    subjects.push(subject);
                }
            }
        }

        if (subjects.length === 0) {
            throw new Error('Aucune matière valide trouvée dans le fichier');
        }

        // Calculer la moyenne générale
        const validGrades = subjects
            .map(s => s.studentGrade)
            .filter(grade => grade !== null && !isNaN(grade));
        
        const generalAverage = validGrades.length > 0 
            ? (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(2)
            : 'N/A';

        return {
            studentName: 'Élève',
            period: 'Trimestre',
            subjects,
            generalAverage,
            totalSubjects: subjects.length
        };
    }

    parseGrade(gradeStr) {
        if (!gradeStr || gradeStr.trim() === '' || gradeStr.toLowerCase() === 'disp' || gradeStr.toLowerCase() === 'abs') {
            return null;
        }
        
        const grade = parseFloat(gradeStr.replace(',', '.'));
        return isNaN(grade) ? null : grade;
    }

    async generateBulletin() {
        if (!this.bulletinData) {
            alert('Veuillez d\'abord importer un bulletin.');
            return;
        }

        try {
            // Masquer la section d'upload
            document.querySelector('.bulletin-section').style.display = 'none';
            
            // Créer et afficher l'indicateur de progression
            const progressIndicator = this.createProgressIndicator();
            document.querySelector('main').appendChild(progressIndicator);
            
            this.updateProgressDisplay(progressIndicator, 'Génération de l\'appréciation générale...', 0, 1);

            // Générer l'appréciation générale
            const generalAppreciation = await this.generateGeneralAppreciation(this.bulletinData);
            
            this.updateProgressDisplay(progressIndicator, 'Finalisation du bulletin...', 1, 1);
            
            // Supprimer l'indicateur de progression
            if (progressIndicator && progressIndicator.parentNode) {
                progressIndicator.parentNode.removeChild(progressIndicator);
            }

            // Afficher le bulletin
            this.displayBulletin(this.bulletinData, generalAppreciation);
            
        } catch (error) {
            console.error('Erreur lors de la génération du bulletin:', error);
            alert('Une erreur est survenue lors de la génération du bulletin.');
        }
    }

    async generateGeneralAppreciation(bulletinData) {
        const prompt = this.buildGeneralAppreciationPrompt(bulletinData);
        
        try {
            const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "deepseek-ai/DeepSeek-V3-0324",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    stream: false,
                    max_tokens: 120,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const data = await response.json();
            let appreciation = data.choices[0].message.content.trim();
            
            // Nettoyer l'appréciation
            appreciation = appreciation.replace(/^["']|["']$/g, '');
            appreciation = appreciation.replace(/^(Appréciation\s*:?\s*|Appréciation générale\s*:?\s*)/i, '');
            appreciation = appreciation.replace(/\s*\(\d+\s*caractères?\)\.?$/i, '');
            appreciation = appreciation.replace(/\s+/g, ' ').trim();
            
            return appreciation;
            
        } catch (error) {
            console.error('Erreur API pour l\'appréciation générale:', error);
            return this.generateFallbackGeneralAppreciation(bulletinData);
        }
    }

    buildGeneralAppreciationPrompt(bulletinData) {
        const trimesterSelectElement = document.getElementById('trimesterSelect');
        const selectedTrimester = trimesterSelectElement ? parseInt(trimesterSelectElement.value) : 1;
        
        let prompt = `Tu es un professeur principal expérimenté. `;
        
        if (selectedTrimester === 3) {
            prompt += `Rédige une appréciation générale de FIN D'ANNÉE scolaire (3ème trimestre).\n\n`;
        } else {
            prompt += `Rédige une appréciation générale de bulletin scolaire pour le ${selectedTrimester}${selectedTrimester === 1 ? 'er' : 'ème'} trimestre.\n\n`;
        }
        
        prompt += `Données de l'élève:\n`;
        prompt += `- Moyenne générale: ${bulletinData.generalAverage}/20\n`;
        prompt += `- Nombre de matières: ${bulletinData.totalSubjects}\n`;
        prompt += `- Trimestre: ${selectedTrimester}${selectedTrimester === 1 ? 'er' : selectedTrimester === 3 ? 'ème (fin d\'année)' : 'ème'}\n\n`;
        
        prompt += `Appréciations par matière:\n`;
        bulletinData.subjects.forEach(subject => {
            if (subject.appreciation && subject.appreciation.trim()) {
                const grade = subject.studentGrade !== null ? subject.studentGrade.toFixed(2) : 'N/A';
                prompt += `- ${subject.name} (${grade}/20): ${subject.appreciation}\n`;
            }
        });
        
        if (selectedTrimester === 3) {
            prompt += `\nRédige une appréciation générale de FIN D'ANNÉE qui :
- Fait un bilan global de l'année scolaire
- Mentionne la moyenne générale de manière appropriée
- Donne des perspectives pour l'année suivante ou l'orientation
- Évite les conseils de progression (c'est la fin d'année)
- Reste concise (environ 180-200 caractères maximum)
- Utilise un ton professionnel et bienveillant de fin d'année`;
        } else {
            prompt += `\nRédige une appréciation générale qui :
- Fait une synthèse globale des résultats et du comportement
- Mentionne la moyenne générale de manière appropriée
- Donne des conseils constructifs pour la suite du trimestre
- Reste concise (environ 180-200 caractères maximum)
- Utilise un ton professionnel et bienveillant`;
        }
        
        prompt += `
Ne fais jamais apparaitre **, ou Appréciation pour ou appréciation

Écris directement l'appréciation générale sans introduction ni explication.`;
        
        return prompt;
    }

    generateFallbackGeneralAppreciation(bulletinData) {
        const average = parseFloat(bulletinData.generalAverage);
        const trimesterSelectElement = document.getElementById('trimesterSelect');
        const selectedTrimester = trimesterSelectElement ? parseInt(trimesterSelectElement.value) : 1;
        let appreciation = "";

        if (isNaN(average)) {
            if (selectedTrimester === 3) {
                return "Année avec des résultats variables selon les matières. Bilan à consolider pour la suite.";
            } else {
                return "Trimestre avec des résultats variables selon les matières. Poursuivre les efforts.";
            }
        }

        // Appréciation basée sur la moyenne
        if (selectedTrimester === 3) {
            // Appréciations de fin d'année
            if (average >= 16) {
                appreciation = "Excellente année scolaire avec de très bons résultats. Félicitations pour ce parcours exemplaire.";
            } else if (average >= 14) {
                appreciation = "Très bonne année avec des résultats satisfaisants. Bon travail, continuez ainsi l'année prochaine.";
            } else if (average >= 12) {
                appreciation = "Année correcte avec des résultats convenables. Quelques efforts à maintenir pour l'année suivante.";
            } else if (average >= 10) {
                appreciation = "Année satisfaisante mais des progrès restent nécessaires. Travail à intensifier l'année prochaine.";
            } else {
                appreciation = "Année difficile avec des résultats insuffisants. Un travail soutenu sera indispensable l'année prochaine.";
            }
        } else {
            // Appréciations de trimestre
            if (average >= 16) {
                appreciation = "Excellent trimestre avec de très bons résultats dans l'ensemble des matières.";
            } else if (average >= 14) {
                appreciation = "Très bon trimestre avec des résultats satisfaisants dans la plupart des matières.";
            } else if (average >= 12) {
                appreciation = "Bon trimestre avec des résultats corrects. Quelques efforts à poursuivre.";
            } else if (average >= 10) {
                appreciation = "Trimestre satisfaisant mais des progrès sont nécessaires dans plusieurs matières.";
            } else {
                appreciation = "Trimestre difficile avec des résultats insuffisants. Un travail soutenu est indispensable.";
            }
        }

        return appreciation;
    }

    displayBulletin(bulletinData, generalAppreciation) {
        const container = document.getElementById('bulletinContainer');
        const resultsSection = document.getElementById('bulletinResultsSection');
        const trimesterSelectElement = document.getElementById('trimesterSelect');
        const selectedTrimester = trimesterSelectElement ? parseInt(trimesterSelectElement.value) : 1;
        const trimesterText = selectedTrimester === 1 ? '1er Trimestre' : 
                             selectedTrimester === 2 ? '2ème Trimestre' : 
                             '3ème Trimestre (Fin d\'année)';
        
        // Stocker les données pour la copie
        this.currentBulletin = bulletinData;
        this.currentGeneralAppreciation = generalAppreciation;
        
        if (!container) {
            console.error('Élément bulletinContainer non trouvé');
            return;
        }
        
        container.innerHTML = `
            <div class="bulletin-header">
                <div class="bulletin-student-name">${bulletinData.studentName}</div>
                <div class="bulletin-period">${trimesterText}</div>
            </div>
            
            <div class="bulletin-stats">
                <div class="stat-item">
                    <div class="stat-label">Moyenne Générale</div>
                    <div class="stat-value">${bulletinData.generalAverage}/20</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Nombre de Matières</div>
                    <div class="stat-value">${bulletinData.totalSubjects}</div>
                </div>
            </div>
            
            <div class="bulletin-subjects">
                <div class="subject-line">
                    <div>MATIÈRE</div>
                    <div>PROFESSEUR</div>
                    <div>NOTE</div>
                    <div>MOY.</div>
                    <div>MIN</div>
                    <div>MAX</div>
                    <div>H/SEM</div>
                    <div>APPRÉCIATION</div>
                </div>
                ${bulletinData.subjects.map(subject => `
                    <div class="subject-line">
                        <div class="subject-name" data-label="Matière">${subject.name}</div>
                        <div class="subject-teacher" data-label="Professeur">${subject.teacher}</div>
                        <div class="subject-grade" data-label="Note">${subject.studentGrade !== null ? subject.studentGrade.toFixed(2) : 'Disp'}</div>
                        <div class="subject-grade" data-label="Moyenne">${subject.classAverage !== null ? subject.classAverage.toFixed(2) : '-'}</div>
                        <div class="subject-grade" data-label="Min">${subject.minGrade !== null ? subject.minGrade.toFixed(2) : '-'}</div>
                        <div class="subject-grade" data-label="Max">${subject.maxGrade !== null ? subject.maxGrade.toFixed(2) : '-'}</div>
                        <div data-label="Heures">${subject.hours}</div>
                        <div class="subject-appreciation" data-label="Appréciation">${subject.appreciation}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="bulletin-general-appreciation">
                <div class="general-appreciation-header">
                    ${selectedTrimester === 3 ? 'Appréciation Générale de Fin d\'Année' : 'Appréciation Générale'}
                    <button id="copyAppreciationBtn" class="copy-appreciation-btn">
                        <span class="btn-icon">📋</span>
                        Copier
                    </button>
                </div>
                <div class="general-appreciation-text">${generalAppreciation}</div>
                
                <div class="new-appreciation-section">
                    <button id="newAppreciationBtn" class="new-appreciation-btn">
                        <span class="btn-icon">➕</span>
                        Nouvelle appréciation pour un autre élève
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter l'event listener pour le bouton de copie de l'appréciation
        const copyAppreciationBtn = container.querySelector('#copyAppreciationBtn');
        if (copyAppreciationBtn) {
            copyAppreciationBtn.addEventListener('click', () => {
                this.copyGeneralAppreciation();
            });
        }
        
        // Ajouter l'event listener pour le bouton nouvelle appréciation
        const newAppreciationBtn = container.querySelector('#newAppreciationBtn');
        if (newAppreciationBtn) {
            newAppreciationBtn.addEventListener('click', () => {
                this.startNewAppreciation();
            });
        }
        
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }
    }

    copyBulletin() {
        if (!this.currentBulletin) {
            alert('Aucun bulletin à copier');
            return;
        }

        let bulletinText = '';
        
        // Ajouter chaque matière au format demandé
        this.currentBulletin.subjects.forEach(subject => {
            bulletinText += `${subject.name}\n`;
            bulletinText += `${subject.teacher}\n`;
            bulletinText += `${subject.studentGrade !== null ? subject.studentGrade.toFixed(2) : 'Disp'}\n`;
            bulletinText += `${subject.classAverage !== null ? subject.classAverage.toFixed(2) : '-'}\n`;
            bulletinText += `${subject.minGrade !== null ? subject.minGrade.toFixed(2) : '-'}\n`;
            bulletinText += `${subject.maxGrade !== null ? subject.maxGrade.toFixed(2) : '-'}\n`;
            bulletinText += `${subject.hours}\n`;
            bulletinText += `${subject.appreciation}\n`;
        });

        navigator.clipboard.writeText(bulletinText).then(() => {
            const button = document.getElementById('copyBulletinBtn');
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="btn-icon">✓</span>Copié !';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
            alert('Erreur lors de la copie dans le presse-papiers');
        });
    }

    copyGeneralAppreciation() {
        if (!this.currentGeneralAppreciation) {
            alert('Aucune appréciation générale à copier');
            return;
        }

        navigator.clipboard.writeText(this.currentGeneralAppreciation).then(() => {
            const button = document.getElementById('copyAppreciationBtn');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<span class="btn-icon">✓</span>Copié !';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
            alert('Erreur lors de la copie dans le presse-papiers');
        });
    }

    clearBulletin() {
        const bulletinTextArea = document.getElementById('bulletinTextArea');
        const statusElement = document.getElementById('bulletinStatus');
        const resultsSection = document.getElementById('bulletinResultsSection');
        
        if (bulletinTextArea) {
            bulletinTextArea.value = '';
        }
        
        this.bulletinData = null;
        
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'file-status';
        }
        
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        // Réafficher la section bulletin
        const bulletinSection = document.querySelector('.bulletin-section');
        if (bulletinSection) {
            bulletinSection.style.display = 'block';
        }
        
        this.enableBulletinButton(false);
    }

    pasteFromClipboard() {
        const button = document.getElementById('pasteFromClipboardBtn');
        const bulletinTextArea = document.getElementById('bulletinTextArea');
        
        if (!button || !bulletinTextArea) {
            console.warn('Éléments de collage non trouvés');
            alert('Erreur: éléments de l\'interface non trouvés');
            return;
        }
        
        const originalContent = button.innerHTML;
        
        // Vérifier si l'API Clipboard est supportée
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            alert('La fonction de collage automatique n\'est pas supportée par votre navigateur. Utilisez Ctrl+V dans la zone de texte.');
            return;
        }

        // Changer l'apparence du bouton pendant le traitement
        button.innerHTML = '<span class="btn-icon">⏳</span>Collage en cours...';
        button.disabled = true;

        navigator.clipboard.readText()
            .then(text => {
                if (text.trim()) {
                    bulletinTextArea.value = text;
                    this.handleBulletinTextChange();
                    
                    // Feedback de succès
                    button.innerHTML = '<span class="btn-icon">✓</span>Collé !';
                    button.classList.add('success');
                    
                    setTimeout(() => {
                        button.innerHTML = originalContent;
                        button.classList.remove('success');
                        button.disabled = false;
                    }, 2000);
                } else {
                    // Presse-papiers vide
                    button.innerHTML = '<span class="btn-icon">⚠️</span>Presse-papiers vide';
                    
                    setTimeout(() => {
                        button.innerHTML = originalContent;
                        button.disabled = false;
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Erreur lors de la lecture du presse-papiers:', err);
                
                // Feedback d'erreur
                button.innerHTML = '<span class="btn-icon">❌</span>Erreur';
                
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.disabled = false;
                }, 2000);
                
                // Message d'aide pour l'utilisateur
                alert('Impossible de lire le presse-papiers automatiquement. Veuillez utiliser Ctrl+V dans la zone de texte ou autoriser l\'accès au presse-papiers dans votre navigateur.');
            });
    }

    startNewAppreciation() {
        // Masquer la section des résultats
        const resultsSection = document.getElementById('bulletinResultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        // Réafficher la section bulletin
        const bulletinSection = document.querySelector('.bulletin-section');
        if (bulletinSection) {
            bulletinSection.style.display = 'block';
        }
        
        // Vider la zone de texte
        const bulletinTextArea = document.getElementById('bulletinTextArea');
        if (bulletinTextArea) {
            bulletinTextArea.value = '';
            bulletinTextArea.focus(); // Mettre le focus sur la zone de texte
        }
        
        // Réinitialiser les données
        this.bulletinData = null;
        this.currentBulletin = null;
        this.currentGeneralAppreciation = null;
        
        // Réinitialiser le statut
        const statusElement = document.getElementById('bulletinStatus');
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'file-status';
        }
        
        // Désactiver le bouton de génération
        this.enableBulletinButton(false);
        
        // Faire défiler vers le haut de la page bulletin
        const bulletinContent = document.getElementById('bulletinContent');
        if (bulletinContent) {
            bulletinContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    new AppreciationGenerator();
});

// Fonction globale pour copier une appréciation individuelle
window.copyIndividualAppreciation = function(button, appreciation) {
    navigator.clipboard.writeText(appreciation).then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<span class="copy-icon">✓</span>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        alert('Erreur lors de la copie dans le presse-papiers');
    });
}; 