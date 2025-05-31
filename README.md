# 📚 Générateur d'Appréciations Scolaires

Une application web moderne qui utilise l'IA Chutes.AI pour générer automatiquement des appréciations scolaires personnalisées basées sur les notes des élèves.

## ✨ Fonctionnalités

- **Import CSV multi-trimestres** : Importez les notes des 1er, 2ème et/ou 3ème trimestres
- **Analyse intelligente** : Distinction automatique entre devoirs sur table (coeff > 1) et TP (coeff = 1)
- **Génération IA** : Appréciations personnalisées de 160 caractères maximum via Chutes.AI
- **Analyse d'évolution** : Suivi de la progression entre trimestres
- **Export facile** : Export CSV et copie en un clic
- **Interface moderne** : Design responsive et intuitive
- **🤖 API préconfigurée** : Prêt à l'emploi, aucune configuration requise

## 🚀 Utilisation

### 1. Lancement
1. Ouvrez `index.html` dans votre navigateur
2. L'API Chutes.AI est déjà configurée et prête ✅

### 2. Import des notes
Préparez vos fichiers CSV dans l'un des formats supportés :

**📋 Format Standard :**
```csv
Nom,Prénom,Note1(coeff),Note2(coeff),Note3(coeff),...
Dupont,Jean,15(3),12(1),18(3),14(1)
Martin,Sophie,16(3),15(1),14(3),13(1)
```

**🧪 Format Physique-Chimie :**
```csv
;;Date1;Date2;Date3;...
33 élèves;Moyenne;4;1;4;1;2
"NOM Prénom";"Moyenne";"Note1";"Note2";"Note3";...
```

### 3. Génération
1. Uploadez vos fichiers CSV (un ou plusieurs trimestres)
2. Cliquez sur "Analyser et Générer les Appréciations"
3. L'IA génère des appréciations personnalisées en temps réel

### 4. Export
- **Export CSV** : Télécharge un fichier avec toutes les appréciations
- **Copier tout** : Copie toutes les appréciations dans le presse-papier

## 🔧 Configuration technique

### API intégrée
- **Token** : Préconfigré dans l'application
- **Modèle** : `deepseek-ai/DeepSeek-V3-0324`
- **Paramètres** : `max_tokens: 200`, `temperature: 0.7`
- **Limite** : 160 caractères par appréciation

## 📊 Analyse des données

L'application analyse automatiquement :
- **Moyennes pondérées** par coefficient
- **Évolution** entre trimestres (progression/régression/stable)
- **Points forts/faibles** basés sur les performances
- **Priorité aux devoirs sur table** dans l'appréciation

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **IA** : API Chutes.AI (DeepSeek-V3)
- **Design** : Interface moderne et responsive
- **Stockage** : LocalStorage pour le token API

## 📝 Exemple d'appréciation générée

> "Très bons résultats aux évaluations (15.2/20). Progression constante depuis le T1. Excellent travail en TP. Continuez ainsi !"

## 🔒 Sécurité

- Token API stocké localement (pas de transmission serveur)
- Validation des données CSV
- Gestion d'erreurs robuste
- Fallback en cas d'échec API

## 🎯 Conseils d'utilisation

1. **Préparez vos CSV** avec des coefficients cohérents
2. **Importez plusieurs trimestres** pour une analyse d'évolution
3. **Vérifiez les moyennes** affichées avant génération
4. **Personnalisez** si nécessaire les appréciations générées

## 📞 Support

Pour toute question ou problème :
- Vérifiez le format de vos fichiers CSV
- Assurez-vous que votre token API est valide
- Consultez la console du navigateur pour les erreurs

---

*Développé pour faciliter le travail des enseignants avec l'aide de l'IA moderne.* 