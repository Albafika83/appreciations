class AppreciationGenerator {
    constructor() {
        this.studentsData = new Map();
        this.bulletinData = null;
        this.n8nWebhookUrl = '';
        this.investmentCriteria = {
            positive: [
                "s'investit/participe en classe",
                "fait des efforts",
                "très sérieux",
                "motivé",
                "travail personnel suffisant",
                "notions acquises"
            ],
            negative: [
                "ne s'investit/ne participe pas en classe",
                "ne fait aucun effort",
                "comportement immature",
                "manque de concentration",
                "travail personnel insuffisant",
                "notions non acquises",
                "comportement perturbateur",
                "manque de rigueur",
                "des facilités",
                "des difficultés/lacunes"
            ]
        };
        this.initializeEventListeners();
        this.initializeNavigation();
        this.hideApiConfig();
        this.setupWebhook();
        this.updateApiStatus();
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

        // Masquer toutes les sections d'aide dans la sidebar
        document.querySelectorAll('.help-content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la page sélectionnée et la section d'aide correspondante
        if (pageType === 'matiere') {
            const matiereContent = document.getElementById('matiereContent');
            const pageMatiere = document.getElementById('pageMatiere');
            const helpContentMatiere = document.getElementById('helpContentMatiere');
            
            if (matiereContent) {
                matiereContent.classList.add('active');
            }
            if (pageMatiere) {
                pageMatiere.classList.add('active');
            }
            if (helpContentMatiere) {
                helpContentMatiere.classList.add('active');
            }
        } else if (pageType === 'bulletin') {
            const bulletinContent = document.getElementById('bulletinContent');
            const pageBulletin = document.getElementById('pageBulletin');
            const helpContentBulletin = document.getElementById('helpContentBulletin');
            
            if (bulletinContent) {
                bulletinContent.classList.add('active');
            }
            if (pageBulletin) {
                pageBulletin.classList.add('active');
            }
            if (helpContentBulletin) {
                helpContentBulletin.classList.add('active');
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

        // Gestion des boutons de méthode d'import
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                const trimester = e.currentTarget.dataset.trimester;
                this.switchImportMethod(method, trimester);
            });
        });

        // Gestion des zones de texte CSV
        ['csvPaste1', 'csvPaste2', 'csvPaste3'].forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.handleCsvPasteChange(index + 1);
                });
            }
        });

        // Gestion des boutons de validation des données collées
        document.querySelectorAll('.validate-paste-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trimester = parseInt(e.currentTarget.dataset.trimester);
                this.validatePastedData(trimester);
            });
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

        // Boutons pour l'aperçu CSV
        const validateTypesBtn = document.getElementById('validateTypesBtn');
        if (validateTypesBtn) {
            validateTypesBtn.addEventListener('click', () => {
                this.validateEvaluationTypes();
            });
        }

        const backToUploadBtn = document.getElementById('backToUploadBtn');
        if (backToUploadBtn) {
            backToUploadBtn.addEventListener('click', () => {
                this.hideCSVPreview();
            });
        }

        // Boutons pour la sidebar d'aide
        const helpToggleBtn = document.getElementById('helpToggleBtn');
        if (helpToggleBtn) {
            helpToggleBtn.addEventListener('click', () => {
                this.toggleHelpSidebar();
            });
        }

        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                this.closeHelpSidebar();
            });
        }

        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeHelpSidebar();
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

    setupWebhook() {
        const params = new URLSearchParams(location.search);
        const q = params.get('webhook');
        if (q) {
            localStorage.setItem('n8nWebhookUrl', q);
        }
        const defaultUrl = 'https://rajaoha.tplinkdns.com/webhook/appreciations';
        this.n8nWebhookUrl = localStorage.getItem('n8nWebhookUrl') || defaultUrl;
    }

    updateApiStatus() {
        const t = document.getElementById('apiStatusText');
        const s = document.querySelector('.status-indicator');
        if (t) {
            t.textContent = 'Powered by n8n';
        }
        if (s) {
            s.textContent = '🎄';
        }
    }

    async callN8N(prompt) {
        if (!this.n8nWebhookUrl) {
            throw new Error('Webhook n8n manquant');
        }
        const response = await fetch(this.n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const ct = response.headers.get('content-type') || '';
        let content = '';
        if (ct.indexOf('application/json') > -1) {
            const py = await response.json();
            content = py.text || py.result || py.output || py.message || '';
            if (!content && py.choices && py.choices[0] && py.choices[0].message && py.choices[0].message.content) {
                content = py.choices[0].message.content;
            }
            if (!content && typeof py === 'string') {
                content = py;
            }
        } else {
            content = await response.text();
        }
        return (content || '').toString().trim();
    }

    switchImportMethod(method, trimester) {
        // Réinitialiser l'état pour ce trimestre
        this.clearTrimesterData(trimester);
        
        // Gérer l'affichage des boutons
        const trimesterCard = document.querySelector(`[data-trimester="${trimester}"]`).closest('.upload-card');
        const methodBtns = trimesterCard.querySelectorAll('.method-btn');
        const fileArea = trimesterCard.querySelector(`[data-import="file-${trimester}"]`);
        const pasteArea = trimesterCard.querySelector(`[data-import="paste-${trimester}"]`);

        // Mettre à jour les boutons actifs
        methodBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-method="${method}"][data-trimester="${trimester}"]`).classList.add('active');

        // Afficher la zone appropriée
        if (method === 'file') {
            fileArea.classList.add('active');
            pasteArea.classList.remove('active');
        } else {
            fileArea.classList.remove('active');
            pasteArea.classList.add('active');
        }
    }

    clearTrimesterData(trimester) {
        // Effacer les données du trimestre
        const studentsToRemove = [];
        for (const [key, student] of this.studentsData) {
            const updatedStudent = { ...student };
            delete updatedStudent[`trimestre${trimester}`];
            
            // Si l'élève n'a plus de données pour aucun trimestre, le supprimer
            if (!updatedStudent.trimestre1 && !updatedStudent.trimestre2 && !updatedStudent.trimestre3) {
                studentsToRemove.push(key);
            } else {
                this.studentsData.set(key, updatedStudent);
            }
        }
        
        studentsToRemove.forEach(key => this.studentsData.delete(key));

        // Réinitialiser l'interface
        const statusElement = document.getElementById(`status${trimester}`);
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'file-status';
        }

        // Réinitialiser les champs
        const fileInput = document.getElementById(`trimestre${trimester}`);
        const pasteArea = document.getElementById(`csvPaste${trimester}`);
        const validateBtn = document.querySelector(`[data-trimester="${trimester}"].validate-paste-btn`);

        if (fileInput) fileInput.value = '';
        if (pasteArea) pasteArea.value = '';
        if (validateBtn) validateBtn.disabled = true;

        this.hideCSVPreview();
        this.enableAnalyzeButton();
    }

    handleCsvPasteChange(trimester) {
        const pasteArea = document.getElementById(`csvPaste${trimester}`);
        const validateBtn = document.querySelector(`[data-trimester="${trimester}"].validate-paste-btn`);
        const statusElement = document.getElementById(`status${trimester}`);

        if (!pasteArea || !validateBtn) return;

        const hasContent = pasteArea.value.trim().length > 0;
        validateBtn.disabled = !hasContent;

        if (hasContent) {
            statusElement.textContent = '📋 Données collées - Cliquez sur "Valider les données"';
            statusElement.className = 'file-status';
        } else {
            statusElement.textContent = '';
            statusElement.className = 'file-status';
        }
    }

    async validatePastedData(trimester) {
        const pasteArea = document.getElementById(`csvPaste${trimester}`);
        const statusElement = document.getElementById(`status${trimester}`);
        const validateBtn = document.querySelector(`[data-trimester="${trimester}"].validate-paste-btn`);

        if (!pasteArea || !pasteArea.value.trim()) {
            statusElement.textContent = '❌ Aucune donnée à valider';
            statusElement.className = 'file-status error';
            return;
        }

        try {
            validateBtn.disabled = true;
            statusElement.textContent = '⏳ Validation en cours...';
            statusElement.className = 'file-status';

            const csvText = pasteArea.value.trim();
            const parseResult = this.parseCSVWithPreview(csvText, trimester);
            
            // Afficher l'aperçu CSV pour configuration
            this.showCSVPreview(parseResult, trimester);
            
            statusElement.textContent = `📊 Données validées - ${parseResult.students.length} élèves détectés`;
            statusElement.className = 'file-status success';
            
        } catch (error) {
            console.error('Erreur lors de la validation des données:', error);
            statusElement.textContent = `❌ ${error.message}`;
            statusElement.className = 'file-status error';
            validateBtn.disabled = false;
            this.hideCSVPreview();
        }
    }

    async handleFileUpload(event, trimestre) {
        const file = event.target.files[0];
        const statusElement = document.getElementById(`status${trimestre}`);
        
        if (!file) {
            statusElement.textContent = '';
            statusElement.className = 'file-status';
            this.hideCSVPreview();
            return;
        }

        try {
            const csvText = await this.readFile(file);
            const parseResult = this.parseCSVWithPreview(csvText, trimestre);
            
            // Afficher l'aperçu CSV pour configuration
            this.showCSVPreview(parseResult, trimestre);
            
            statusElement.textContent = `📊 Fichier chargé - ${parseResult.students.length} élèves détectés`;
            statusElement.className = 'file-status success';
            
        } catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            statusElement.textContent = `❌ ${error.message}`;
            statusElement.className = 'file-status error';
            this.hideCSVPreview();
        }
    }

    enableAnalyzeButton() {
        const hasData = this.studentsData.size > 0;
        const button = document.getElementById('analyzeBtn');
        button.disabled = !hasData;
        
        if (hasData) {
            button.innerHTML = '<span class="btn-icon">👥</span>Définir l\'investissement des élèves';
        }
    }

    parseCSVWithPreview(csvText, trimestre) {
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 3) {
            throw new Error('Format de fichier invalide');
        }

        // Détecter le format du fichier
        // Format 1: ligne 0 contient "élèves" (notre nouveau format)
        // Format 2: ligne 1 contient "élèves" et "Moyenne" (format original)
        const isPhysiqueChimieFormat = lines[0].includes('élèves') || 
                                       (lines[1].includes('élèves') && lines[1].includes('Moyenne'));
        
        if (isPhysiqueChimieFormat) {
            return this.parsePhysiqueChimieFormatWithPreview(lines, trimestre);
        } else {
            return this.parseStandardFormatWithPreview(lines, trimestre);
        }
    }

    parsePhysiqueChimieFormatWithPreview(lines, trimestre) {
        const students = [];
        
        // Pour ce format spécifique :
        // Ligne 0: "19 élèves" + en-têtes
        // Ligne 1: coefficients
        // Ligne 2+: données élèves
        const headerLineIndex = 0;
        const coeffLineIndex = 1;
        const dataStartIndex = 2;
        
        const headerLine = lines[headerLineIndex];
        const headerParts = this.detectAndParseCSVLine(headerLine);
        const coeffLine = lines[coeffLineIndex];
        const coeffParts = this.detectAndParseCSVLine(coeffLine);
        

        
        // Extraire les colonnes de notes (en ignorant la colonne "Moyenne")
        const columns = [];
        
        // Commencer à partir de l'index 3 pour ignorer: nom(0), classe(1), moyenne(2)
        for (let i = 3; i < headerParts.length; i++) {
            const header = headerParts[i] ? headerParts[i].trim() : '';
            const coeff = coeffParts[i] ? coeffParts[i].trim() : '';
            let coeffValue = 1;
            
            // Parser le coefficient
            if (coeff && !isNaN(parseInt(coeff))) {
                coeffValue = parseInt(coeff);
            } else if (coeff.includes('/')) {
                const match = coeff.match(/(\d+)/);
                if (match) {
                    coeffValue = parseInt(match[1]);
                }
            }
            
            columns.push({
                index: i,
                title: header || `Colonne ${i - 2}`, // -2 car on ignore nom et classe
                coeff: coeffValue,
                evaluationType: this.getDefaultEvaluationType(coeffValue)
            });
        }

        // Parser les données des élèves pour l'aperçu
        const previewData = [];
        for (let i = dataStartIndex; i < Math.min(lines.length, dataStartIndex + 5); i++) { // Limiter à 5 élèves pour l'aperçu
            const line = lines[i].trim();
            if (!line || line.includes('Moy. de la classe') || line.includes('moyennes') || 
                line.match(/^\s*\d+[,\.]\d+/)) continue; // Ignorer les lignes de moyennes

            try {
                const parts = this.detectAndParseCSVLine(line);
                if (parts.length < 3) continue;

                const fullName = parts[0].replace(/"/g, '').trim();
                if (!fullName) continue;

                let nom, prenom;
                const nameParts = fullName.split(' ');
                if (nameParts.length >= 2) {
                    // Format "NOM Prénom" ou "PRÉNOM Nom"
                    // On assume que le premier mot en majuscules est le nom de famille
                    if (nameParts[0] === nameParts[0].toUpperCase() && nameParts[0] !== nameParts[0].toLowerCase()) {
                        nom = nameParts[0];
                        prenom = nameParts.slice(1).join(' ');
                    } else {
                        // Si pas de distinction claire, prendre le dernier comme nom
                        nom = nameParts[nameParts.length - 1];
                        prenom = nameParts.slice(0, -1).join(' ');
                    }
                } else {
                    nom = fullName;
                    prenom = fullName;
                }

                const rowData = [prenom + ' ' + nom, parts[1] || '', parts[2] || '']; // Nom, Classe, Moyenne
                for (let j = 3; j < parts.length && j - 3 < columns.length; j++) {
                    const notePart = parts[j].replace(/"/g, '').trim();
                    rowData.push(notePart || '-');
                }
                
                previewData.push(rowData);
            } catch (error) {
                console.warn(`Erreur ligne ${i + 1}: ${error.message}`);
            }
        }

        // Parser tous les élèves pour les données finales
        for (let i = dataStartIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.includes('Moy. de la classe') || line.includes('moyennes') || 
                line.match(/^\s*\d+[,\.]\d+/)) continue; // Ignorer les lignes de moyennes

            try {
                const parts = this.detectAndParseCSVLine(line);
                
                if (parts.length < 3) continue;

                const fullName = parts[0].replace(/"/g, '').trim();
                if (!fullName) continue;

                let nom, prenom;
                const nameParts = fullName.split(' ');
                if (nameParts.length >= 2) {
                    // Format "NOM Prénom" ou "PRÉNOM Nom"
                    // On assume que le premier mot en majuscules est le nom de famille
                    if (nameParts[0] === nameParts[0].toUpperCase() && nameParts[0] !== nameParts[0].toLowerCase()) {
                        nom = nameParts[0];
                        prenom = nameParts.slice(1).join(' ');
                    } else {
                        // Si pas de distinction claire, prendre le dernier comme nom
                        nom = nameParts[nameParts.length - 1];
                        prenom = nameParts.slice(0, -1).join(' ');
                    }
                } else {
                    nom = fullName;
                    prenom = fullName;
                }

                const notes = [];
                // Commencer à la colonne après "Moyenne" (index 3)
                for (let j = 3; j < parts.length && j - 3 < columns.length; j++) {
                    const notePart = parts[j].replace(/"/g, '').trim();
                    if (!notePart || notePart === 'Abs' || notePart === '' || notePart === 'N.Rdu' || notePart === '-') {
                        continue;
                    }

                    const noteStr = notePart.replace(',', '.');
                    const note = parseFloat(noteStr);
                    const columnIndex = j - 3;

                    if (!isNaN(note) && note >= 0 && note <= 20 && columnIndex < columns.length) {
                        notes.push({ 
                            note, 
                            coeff: columns[columnIndex].coeff,
                            evaluationType: columns[columnIndex].evaluationType
                        });
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

        return {
            students,
            columns,
            previewData,
            format: 'physique-chimie'
        };
    }

    parseStandardFormatWithPreview(lines, trimestre) {
        const students = [];
        const columns = [];
        const previewData = [];

        // Analyser la première ligne pour détecter les colonnes
        if (lines.length > 0) {
            const firstLine = this.parseCSVLine(lines[0]);
            for (let i = 2; i < firstLine.length; i++) {
                const notePart = firstLine[i].trim();
                const match = notePart.match(/^(\d+(?:\.\d+)?)\((\d+)\)$/);
                
                if (match) {
                    const coeff = parseInt(match[2]);
                    columns.push({
                        index: i,
                        title: `Colonne ${i - 1}`,
                        coeff: coeff,
                        evaluationType: this.getDefaultEvaluationType(coeff)
                    });
                }
            }
        }

        // Aperçu des données
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                const parts = this.parseCSVLine(line);
                if (parts.length < 3) continue;

                const nom = parts[0].trim();
                const prenom = parts[1].trim();
                const rowData = [prenom + ' ' + nom];

                for (let j = 2; j < parts.length; j++) {
                    const notePart = parts[j].trim();
                    rowData.push(notePart || '-');
                }
                
                previewData.push(rowData);
            } catch (error) {
                console.warn(`Erreur ligne ${i + 1}: ${error.message}`);
            }
        }

        // Parser tous les élèves
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                const parts = this.parseCSVLine(line);
                if (parts.length < 3) continue;

                const nom = parts[0].trim();
                const prenom = parts[1].trim();
                const notes = [];

                for (let j = 2; j < parts.length; j++) {
                    const notePart = parts[j].trim();
                    if (!notePart) continue;

                    const match = notePart.match(/^(\d+(?:\.\d+)?)\((\d+)\)$/);
                    if (match) {
                        const note = parseFloat(match[1]);
                        const coeff = parseInt(match[2]);
                        const columnIndex = j - 2;
                        
                        if (!isNaN(note) && !isNaN(coeff) && note >= 0 && note <= 20 && columnIndex < columns.length) {
                            notes.push({ 
                                note, 
                                coeff,
                                evaluationType: columns[columnIndex].evaluationType
                            });
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

        return {
            students,
            columns,
            previewData,
            format: 'standard'
        };
    }

    getDefaultEvaluationType(coeff) {
        // Déterminer le type d'évaluation basé sur le coefficient
        if (coeff >= 3) {
            return 'devoir';
        } else if (coeff === 2) {
            return 'interrogation';
        } else {
            return 'tp';
        }
    }

    showCSVPreview(parseResult, trimestre) {
        const csvPreviewSection = document.getElementById('csvPreviewSection');
        const csvPreviewContent = document.getElementById('csvPreviewContent');
        
        if (!csvPreviewSection || !csvPreviewContent) return;

        // Masquer les autres sections
        const uploadSection = document.querySelector('.upload-section');
        const analysisSection = document.querySelector('.analysis-section');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (analysisSection) analysisSection.style.display = 'none';

        // Stocker les données pour validation ultérieure
        this.currentParseResult = parseResult;
        this.currentTrimestre = trimestre;

        // Créer le tableau d'aperçu
        let tableHTML = '<table class="csv-preview-table">';
        
        // En-tête avec les noms d'élèves
        tableHTML += '<thead><tr><th>Élève</th><th>Classe</th><th>Moyenne</th>';
        parseResult.columns.forEach(col => {
            tableHTML += `<th>
                <div class="column-info">
                    <span class="column-title">${col.title}</span>
                    <span class="column-coeff">Coeff: ${col.coeff}</span>
                </div>
            </th>`;
        });
        tableHTML += '</tr></thead>';

        // Ligne de configuration des types
        tableHTML += '<tbody><tr class="column-config-header"><td><strong>Type d\'évaluation:</strong></td><td colspan="2">-</td>';
        parseResult.columns.forEach((col, index) => {
            tableHTML += `<td>
                <select class="evaluation-type-select" data-column-index="${index}">
                    <option value="auto" ${col.evaluationType === 'auto' ? 'selected' : ''}>Auto (par coeff)</option>
                    <option value="devoir" ${col.evaluationType === 'devoir' ? 'selected' : ''}>Devoir sur table</option>
                    <option value="interrogation" ${col.evaluationType === 'interrogation' ? 'selected' : ''}>Interrogation</option>
                    <option value="tp" ${col.evaluationType === 'tp' ? 'selected' : ''}>TP/Exercices</option>
                </select>
            </td>`;
        });
        tableHTML += '</tr>';

        // Données d'aperçu
        parseResult.previewData.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
            });
            tableHTML += '</tr>';
        });

        if (parseResult.previewData.length >= 5) {
            tableHTML += '<tr><td colspan="' + (parseResult.columns.length + 3) + '" style="text-align: center; font-style: italic; color: #718096;">... et ' + (parseResult.students.length - 5) + ' autres élèves</td></tr>';
        }

        tableHTML += '</tbody></table>';

        csvPreviewContent.innerHTML = tableHTML;
        csvPreviewSection.style.display = 'block';

        // Scroll vers l'aperçu
        csvPreviewSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideCSVPreview() {
        const csvPreviewSection = document.getElementById('csvPreviewSection');
        if (csvPreviewSection) {
            csvPreviewSection.style.display = 'none';
        }

        // Réafficher les sections principales
        const uploadSection = document.querySelector('.upload-section');
        const analysisSection = document.querySelector('.analysis-section');
        
        if (uploadSection) uploadSection.style.display = 'block';
        if (analysisSection) analysisSection.style.display = 'block';

        // Nettoyer les données temporaires
        this.currentParseResult = null;
        this.currentTrimestre = null;
    }

    validateEvaluationTypes() {
        if (!this.currentParseResult || !this.currentTrimestre) {
            console.error('Aucune donnée à valider');
            return;
        }

        // Récupérer les types d'évaluation sélectionnés
        const selects = document.querySelectorAll('.evaluation-type-select');
        selects.forEach(select => {
            const columnIndex = parseInt(select.dataset.columnIndex);
            const selectedType = select.value;
            
            if (columnIndex < this.currentParseResult.columns.length) {
                if (selectedType === 'auto') {
                    // Utiliser le type par défaut basé sur le coefficient
                    this.currentParseResult.columns[columnIndex].evaluationType = 
                        this.getDefaultEvaluationType(this.currentParseResult.columns[columnIndex].coeff);
                } else {
                    this.currentParseResult.columns[columnIndex].evaluationType = selectedType;
                }
            }
        });

        // Mettre à jour les notes des étudiants avec les nouveaux types
        this.currentParseResult.students.forEach(student => {
            student.notes.forEach((note, noteIndex) => {
                if (noteIndex < this.currentParseResult.columns.length) {
                    note.evaluationType = this.currentParseResult.columns[noteIndex].evaluationType;
                }
            });
        });

        // Intégrer les données dans studentsData
        this.integrateStudentData(this.currentParseResult.students, this.currentTrimestre);

        // Masquer l'aperçu et réactiver le bouton d'analyse
        this.hideCSVPreview();
        this.enableAnalyzeButton();
        
        // Afficher un message de confirmation
        const statusElement = document.getElementById(`status${this.currentTrimestre}`);
        if (statusElement) {
            statusElement.textContent = `✅ ${this.currentParseResult.students.length} élèves importés avec types d'évaluation configurés`;
            statusElement.className = 'file-status success';
        }
    }

    integrateStudentData(students, trimestre) {
        students.forEach(student => {
            const key = `${student.nom}_${student.prenom}`;
            if (!this.studentsData.has(key)) {
                this.studentsData.set(key, {
                    nom: student.nom,
                    prenom: student.prenom,
                    investment: []
                });
            }
            this.studentsData.get(key)[`trimestre${trimestre}`] = student.notes;
        });
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
        // Chercher les trimestres disponibles
        const trimestres = [];
        if (studentData.trimestre1) trimestres.push('trimestre1');
        if (studentData.trimestre2) trimestres.push('trimestre2');
        if (studentData.trimestre3) trimestres.push('trimestre3');
        
        if (trimestres.length === 0) return 'N/A';
        
        // Prendre le dernier trimestre disponible
        const dernierTrimestre = trimestres[trimestres.length - 1];
        const notes = studentData[dernierTrimestre];
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
            } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    parseTabSeparatedLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === '\t' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    detectAndParseCSVLine(line) {
        // Détecter le type de séparateur en comptant les occurrences
        const tabCount = (line.match(/\t/g) || []).length;
        const commaCount = (line.match(/,/g) || []).length;
        const semicolonCount = (line.match(/;/g) || []).length;
        
        // Si on a des tabulations et que les virgules sont probablement des décimales
        if (tabCount > 0 && (tabCount >= commaCount || commaCount < tabCount * 2)) {
            return this.parseTabSeparatedLine(line);
        } else {
            return this.parseCSVLine(line);
        }
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

        // Analyser chaque trimestre disponible
        const trimestresDisponibles = [];
        if (studentData.trimestre1) trimestresDisponibles.push('trimestre1');
        if (studentData.trimestre2) trimestresDisponibles.push('trimestre2');
        if (studentData.trimestre3) trimestresDisponibles.push('trimestre3');

        trimestresDisponibles.forEach(trimestre => {
            const notes = studentData[trimestre];
            
            // Filtrer par type d'évaluation
            const devoirsSurTable = notes.filter(n => 
                n.evaluationType === 'devoir' || (!n.evaluationType && n.coeff > 1)
            );
            const interrogations = notes.filter(n => 
                n.evaluationType === 'interrogation' || (!n.evaluationType && n.coeff === 2)
            );
            const tpExercices = notes.filter(n => 
                n.evaluationType === 'tp' || (!n.evaluationType && n.coeff === 1)
            );

            const moyenneDevoirs = this.calculateWeightedAverage(devoirsSurTable);
            const moyenneInterrogations = this.calculateWeightedAverage(interrogations);
            const moyenneTP = this.calculateWeightedAverage(tpExercices);
            const moyenneGenerale = this.calculateWeightedAverage(notes);

            analysis.trimestres[trimestre] = {
                moyenneDevoirs,
                moyenneInterrogations,
                moyenneTP,
                moyenneGenerale,
                nbDevoirs: devoirsSurTable.length,
                nbInterrogations: interrogations.length,
                nbTP: tpExercices.length
            };
        });

        // Analyser l'évolution
        const trimestresOrdonnes = Object.keys(analysis.trimestres).sort();
        if (trimestresOrdonnes.length > 1) {
            const premier = analysis.trimestres[trimestresOrdonnes[0]];
            const dernier = analysis.trimestres[trimestresOrdonnes[trimestresOrdonnes.length - 1]];
            
            const evolutionDevoirs = dernier.moyenneDevoirs - premier.moyenneDevoirs;
            const evolutionGenerale = dernier.moyenneGenerale - premier.moyenneGenerale;

            // Priorité à l'évolution des devoirs sur table
            const evolutionPrincipale = dernier.moyenneDevoirs && premier.moyenneDevoirs ? 
                evolutionDevoirs : evolutionGenerale;

            if (evolutionPrincipale > 1) {
                analysis.evolution = 'progression';
            } else if (evolutionPrincipale < -1) {
                analysis.evolution = 'régression';
            } else {
                analysis.evolution = 'stable';
            }
        }

        // Identifier points forts et faibles
        const dernierTrimestre = analysis.trimestres[trimestresOrdonnes[trimestresOrdonnes.length - 1]];
        if (dernierTrimestre) {
            if (dernierTrimestre.moyenneDevoirs >= 14) {
                analysis.pointsForts.push('excellents résultats aux devoirs sur table');
            } else if (dernierTrimestre.moyenneDevoirs >= 12) {
                analysis.pointsForts.push('bons résultats aux devoirs sur table');
            }

            if (dernierTrimestre.moyenneInterrogations >= 14) {
                analysis.pointsForts.push('très bonnes interrogations');
            }

            if (dernierTrimestre.moyenneDevoirs < 10) {
                analysis.pointsFaibles.push('difficultés aux devoirs sur table');
            }
            
            if (dernierTrimestre.moyenneInterrogations < 10 && dernierTrimestre.nbInterrogations > 0) {
                analysis.pointsFaibles.push('difficultés aux interrogations');
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
            let appreciation = await this.callN8N(prompt);
            appreciation = appreciation.replace(/^["']|["']$/g, '');
            appreciation = appreciation.replace(/^(Appréciation\s*:?\s*|Appréciation pour.*?:?\s*)/i, '');
            appreciation = appreciation.replace(/\s*\(\d+\s*caractères?\)\.?$/i, '');
            appreciation = appreciation.replace(/\s+/g, ' ').trim();
            if (appreciation.length > 200) {
                const lastPeriod = appreciation.substring(0, 200).lastIndexOf('.');
                if (lastPeriod > 150) {
                    appreciation = appreciation.substring(0, lastPeriod + 1);
                } else {
                    const truncated = appreciation.substring(0, 197);
                    const lastSpace = truncated.lastIndexOf(' ');
                    appreciation = truncated.substring(0, lastSpace) + '...';
                }
            }
            return appreciation;
        } catch (error) {
            console.error('Erreur Webhook n8n:', error);
            return this.generateFallbackAppreciation(studentData, analysis);
        }
    }

    buildPrompt(studentData, analysis) {
        const trimestres = Object.keys(analysis.trimestres).sort();
        const dernierTrimestre = analysis.trimestres[trimestres[trimestres.length - 1]];
        const numeroTrimestre = Math.max(...trimestres.map(t => parseInt(t.replace('trimestre', ''))));
        
        let prompt = `Tu es un professeur expérimenté. Rédige une appréciation scolaire concise et complète pour ${studentData.prenom} ${studentData.nom}.\n\n`;
        
        prompt += `Données académiques:\n`;
        trimestres.forEach(t => {
            const data = analysis.trimestres[t];
            const trimNumber = t.replace('trimestre', '');
            prompt += `- Trimestre ${trimNumber}: Moyenne devoirs sur table ${data.moyenneDevoirs?.toFixed(1) || 'N/A'}/20`;
            if (data.moyenneInterrogations !== null && data.nbInterrogations > 0) {
                prompt += `, interrogations ${data.moyenneInterrogations?.toFixed(1)}/20`;
            }
            prompt += `\n`;
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
- Pour les bons résultats : félicite et encourage pour la suite`;
        } else {
            conseilsSpecifiques = `
- C'est le trimestre ${numeroTrimestre}, tu peux encourager la progression et donner des conseils pour la suite
- Donne des conseils constructifs pour améliorer les résultats`;
        }
        
        // Calculer l'écart entre moyenne devoirs et moyenne générale
        const ecartDevoirs = Math.abs(dernierTrimestre.moyenneDevoirs - dernierTrimestre.moyenneGenerale);
        const mentionnerNoteDevoirs = ecartDevoirs > 3;

        prompt += `\nRédige une appréciation professionnelle qui :
- Mentionne les résultats aux devoirs sur table en priorité
${mentionnerNoteDevoirs ? 
    `- INDIQUE la note chiffrée aux devoirs sur table car écart significatif avec la moyenne générale` : 
    `- NE MENTIONNE PAS la note chiffrée aux devoirs, parle seulement de "bons/très bons/excellents résultats" ou "difficultés"`}
- Intègre le comportement/investissement si pertinent${conseilsSpecifiques}
- Reste très concise (STRICTEMENT moins de 200 caractères)
- IMPÉRATIF : L'appréciation DOIT être complète et se terminer par un point
- Ne mentionne jamais les TP
- Utilise un ton professionnel et bienveillant
- Fais des phrases courtes et va directement à l'essentiel
Ne fais jamais apparaitre **, ou Appréciation pour ou appréciation

Écris directement l'appréciation complète sans introduction ni explication.`;
        
        return prompt;
    }

    generateFallbackAppreciation(studentData, analysis) {
        const trimestres = Object.keys(analysis.trimestres).sort();
        const dernierTrimestre = analysis.trimestres[trimestres[trimestres.length - 1]];
        const numeroTrimestre = Math.max(...trimestres.map(t => parseInt(t.replace('trimestre', ''))));
        
        if (!dernierTrimestre) {
            return "Données insuffisantes pour générer une appréciation.";
        }

        let appreciation = "";
        const moyenneDevoirs = dernierTrimestre.moyenneDevoirs;
        const moyenneGenerale = dernierTrimestre.moyenneGenerale;
        
        // Calculer l'écart entre moyenne devoirs et moyenne générale
        const ecartDevoirs = Math.abs(moyenneDevoirs - moyenneGenerale);
        const mentionnerNoteDevoirs = ecartDevoirs > 3;

        // Résultats académiques (avec ou sans note selon l'écart)
        if (mentionnerNoteDevoirs) {
            // Mention de la note si écart significatif
            if (moyenneDevoirs >= 16) {
                appreciation = `Excellents résultats aux devoirs (${moyenneDevoirs.toFixed(1)}/20)`;
            } else if (moyenneDevoirs >= 14) {
                appreciation = `Très bons résultats aux devoirs (${moyenneDevoirs.toFixed(1)}/20)`;
            } else if (moyenneDevoirs >= 12) {
                appreciation = `Bons résultats aux devoirs (${moyenneDevoirs.toFixed(1)}/20)`;
            } else if (moyenneDevoirs >= 10) {
                appreciation = `Résultats satisfaisants aux devoirs (${moyenneDevoirs.toFixed(1)}/20)`;
            } else {
                appreciation = `Difficultés aux devoirs (${moyenneDevoirs.toFixed(1)}/20)`;
            }
        } else {
            // Pas de mention de note si écart faible
            if (moyenneDevoirs >= 16) {
                appreciation = "Excellents résultats";
            } else if (moyenneDevoirs >= 14) {
                appreciation = "Très bons résultats";
            } else if (moyenneDevoirs >= 12) {
                appreciation = "Bons résultats";
            } else if (moyenneDevoirs >= 10) {
                appreciation = "Résultats satisfaisants";
            } else {
                appreciation = "Difficultés importantes";
            }
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
                    appreciation += ", investi";
                } else if (positiveInvestment[0].includes("efforts")) {
                    appreciation += ", fait des efforts";
                } else if (positiveInvestment[0].includes("sérieux")) {
                    appreciation += ", sérieux";
                } else if (positiveInvestment[0].includes("motivé")) {
                    appreciation += ", motivé";
                } else if (positiveInvestment[0].includes("travail personnel suffisant")) {
                    appreciation += ", bon travail personnel";
                } else if (positiveInvestment[0].includes("notions acquises")) {
                    appreciation += ", notions acquises";
                }
            }
            if (negativeInvestment.length > 0) {
                if (negativeInvestment[0].includes("ne s'investit")) {
                    appreciation += ", peu investi";
                } else if (negativeInvestment[0].includes("aucun effort")) {
                    appreciation += ", aucun effort";
                } else if (negativeInvestment[0].includes("immature")) {
                    appreciation += ", immature";
                } else if (negativeInvestment[0].includes("concentration")) {
                    appreciation += ", manque de concentration";
                } else if (negativeInvestment[0].includes("travail personnel insuffisant")) {
                    appreciation += ", travail insuffisant";
                } else if (negativeInvestment[0].includes("notions non acquises")) {
                    appreciation += ", lacunes importantes";
                } else if (negativeInvestment[0].includes("comportement perturbateur")) {
                    appreciation += ", perturbateur";
                } else if (negativeInvestment[0].includes("manque de rigueur")) {
                    appreciation += ", manque de rigueur";
                } else if (negativeInvestment[0].includes("des facilités")) {
                    appreciation += ", a des facilités";
                } else if (negativeInvestment[0].includes("des difficultés/lacunes")) {
                    appreciation += ", difficultés importantes";
                }
            }
        }

        // Évolution et conseil adaptés au trimestre (version courte)
        if (numeroTrimestre === 3) {
            // Trimestre 3 : bilan de fin d'année
            if (analysis.evolution === 'progression') {
                appreciation += ". Belle progression.";
            } else if (analysis.evolution === 'régression') {
                appreciation += ". Année difficile.";
            } else {
                if (moyenneDevoirs >= 12) {
                    appreciation += ". Année réussie.";
                } else {
                    appreciation += ". Du potentiel à développer.";
                }
            }
        } else {
            // Trimestres 1 et 2 : conseils pour progresser
            if (analysis.evolution === 'progression') {
                appreciation += ". Bonne progression.";
            } else if (analysis.evolution === 'régression') {
                appreciation += ". Plus d'efforts nécessaires.";
            } else {
                if (moyenneDevoirs >= 12) {
                    appreciation += ". Continuez.";
                } else {
                    appreciation += ". Peut mieux faire.";
                }
            }
        }

        // S'assurer que l'appréciation reste sous 200 caractères avec phrases complètes
        if (appreciation.length > 200) {
            // Essayer de couper au dernier point avant 200 caractères
            const lastPeriod = appreciation.substring(0, 200).lastIndexOf('.');
            if (lastPeriod > 120) {
                appreciation = appreciation.substring(0, lastPeriod + 1);
            } else {
                // Forcer une phrase courte
                const moyenneDevoirs = dernierTrimestre.moyenneDevoirs;
                if (moyenneDevoirs >= 14) {
                    appreciation = "Très bons résultats. Continuez ainsi.";
                } else if (moyenneDevoirs >= 12) {
                    appreciation = "Bons résultats. Poursuivez vos efforts.";
                } else if (moyenneDevoirs >= 10) {
                    appreciation = "Résultats satisfaisants. Plus de travail nécessaire.";
                } else {
                    appreciation = "Difficultés importantes. Efforts nécessaires.";
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
                    const trimNumber = t.replace('trimestre', '');
                    let summary = `T${trimNumber}: DS ${data.moyenneDevoirs?.toFixed(1) || 'N/A'}/20`;
                    if (data.moyenneInterrogations !== null && data.nbInterrogations > 0) {
                        summary += `, IT ${data.moyenneInterrogations?.toFixed(1)}/20`;
                    }
                    if (data.moyenneTP !== null && data.nbTP > 0) {
                        summary += `, TP ${data.moyenneTP?.toFixed(1)}/20`;
                    }
                    return summary;
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
            let appreciation = await this.callN8N(prompt);
            appreciation = appreciation.replace(/^["']|["']$/g, '');
            appreciation = appreciation.replace(/^(Appréciation\s*:?\s*|Appréciation générale\s*:?\s*)/i, '');
            appreciation = appreciation.replace(/\s*\(\d+\s*caractères?\)\.?$/i, '');
            appreciation = appreciation.replace(/\s+/g, ' ').trim();
            return appreciation;
        } catch (error) {
            console.error('Erreur Webhook n8n:', error);
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
            </div>
        `;
        
        // Ajouter l'event listener pour le bouton de copie de l'appréciation
        const copyAppreciationBtn = container.querySelector('#copyAppreciationBtn');
        if (copyAppreciationBtn) {
            copyAppreciationBtn.addEventListener('click', () => {
                this.copyGeneralAppreciation();
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

    toggleHelpSidebar() {
        const sidebar = document.getElementById('helpSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('open');
            
            if (isOpen) {
                this.closeHelpSidebar();
            } else {
                this.openHelpSidebar();
            }
        }
    }

    openHelpSidebar() {
        const sidebar = document.getElementById('helpSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            
            // Empêcher le scroll du body quand la sidebar est ouverte
            document.body.style.overflow = 'hidden';
        }
    }

    closeHelpSidebar() {
        const sidebar = document.getElementById('helpSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            
            // Réactiver le scroll du body
            document.body.style.overflow = '';
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