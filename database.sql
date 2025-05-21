-- Create tables for main entities

CREATE TABLE MachineElectrique (

    id INTEGER PRIMARY KEY,

    nom VARCHAR(255) NOT NULL,

    etat VARCHAR(100) NOT NULL,

    valeur VARCHAR(100) NOT NULL,

    dateProchaineMaint DATE

);



CREATE TABLE Section (

    id INTEGER PRIMARY KEY,

    nom VARCHAR(255) NOT NULL,

    type VARCHAR(100) NOT NULL,

    responsable_id INTEGER

);



CREATE TABLE Utilisateur (

    id INTEGER PRIMARY KEY,

    nom VARCHAR(255) NOT NULL,

    section VARCHAR(255) NOT NULL,

    credentials VARCHAR(255) NOT NULL,

    section_id INTEGER,

    FOREIGN KEY (section_id) REFERENCES Section(id)

);



-- Add foreign key constraint after both tables exist

ALTER TABLE Section 

ADD CONSTRAINT fk_section_responsable 

FOREIGN KEY (responsable_id) REFERENCES Utilisateur(id);



CREATE TABLE Role (

    id INTEGER PRIMARY KEY,

    nom VARCHAR(255) NOT NULL,

    cout DOUBLE PRECISION NOT NULL

);



CREATE TABLE Permission (

    id INTEGER PRIMARY KEY,

    module VARCHAR(255) NOT NULL,

    action VARCHAR(100) NOT NULL,

    description TEXT

);



CREATE TABLE RolePermission (

    role_id INTEGER,

    permission_id INTEGER,

    PRIMARY KEY (role_id, permission_id),

    FOREIGN KEY (role_id) REFERENCES Role(id),

    FOREIGN KEY (permission_id) REFERENCES Permission(id)

);



CREATE TABLE Intervention (

    id INTEGER PRIMARY KEY,

    date DATE NOT NULL,

    description TEXT,

    typeOperation VARCHAR(100) NOT NULL,

    statut VARCHAR(50) NOT NULL,

    urgence BOOLEAN NOT NULL DEFAULT FALSE,

    machine_id INTEGER NOT NULL,

    FOREIGN KEY (machine_id) REFERENCES MachineElectrique(id)

);



CREATE TABLE Planification (

    id INTEGER PRIMARY KEY,

    dateCreation DATE NOT NULL,

    capaciteExecution INTEGER NOT NULL,

    urgencePrise BOOLEAN NOT NULL DEFAULT FALSE,

    disponibilitePDR BOOLEAN,

    utilisateur_id INTEGER NOT NULL,

    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)

);



CREATE TABLE Diagnostic (

    id INTEGER PRIMARY KEY,

    dateCreation DATE NOT NULL,

    intervention_id INTEGER NOT NULL,

    FOREIGN KEY (intervention_id) REFERENCES Intervention(id)

);



-- Junction table for Diagnostic.travailRequis (List<String>)

CREATE TABLE DiagnosticTravailRequis (

    diagnostic_id INTEGER,

    travail VARCHAR(255),

    PRIMARY KEY (diagnostic_id, travail),

    FOREIGN KEY (diagnostic_id) REFERENCES Diagnostic(id)

);



-- Junction table for Diagnostic.besoinPDR (List<String>)

CREATE TABLE DiagnosticBesoinPDR (

    diagnostic_id INTEGER,

    besoin VARCHAR(255),

    PRIMARY KEY (diagnostic_id, besoin),

    FOREIGN KEY (diagnostic_id) REFERENCES Diagnostic(id)

);



-- Junction table for Diagnostic.chargesRealisees (List<String>)

CREATE TABLE DiagnosticChargesRealisees (

    diagnostic_id INTEGER,

    charge VARCHAR(255),

    PRIMARY KEY (diagnostic_id, charge),

    FOREIGN KEY (diagnostic_id) REFERENCES Diagnostic(id)

);



CREATE TABLE ControleQualite (

    id INTEGER PRIMARY KEY,

    dateControle DATE NOT NULL,

    resultatsEssais TEXT,

    analyseVibratoire TEXT,

    intervention_id INTEGER,

    FOREIGN KEY (intervention_id) REFERENCES Intervention(id)

);



CREATE TABLE Renovation (

    intervention_id INTEGER PRIMARY KEY,

    disponibilitePDR BOOLEAN NOT NULL,

    objectif TEXT NOT NULL,

    cout DOUBLE PRECISION NOT NULL,

    dureeEstimee INTEGER NOT NULL,

    FOREIGN KEY (intervention_id) REFERENCES Intervention(id)

);



CREATE TABLE Maintenance (

    intervention_id INTEGER PRIMARY KEY,

    typeMaintenance VARCHAR(100) NOT NULL,

    duree INTEGER NOT NULL,

    FOREIGN KEY (intervention_id) REFERENCES Intervention(id)

);



-- Junction table for Maintenance.pieces (List<String>)

CREATE TABLE MaintenancePieces (

    maintenance_id INTEGER,

    piece VARCHAR(255),

    PRIMARY KEY (maintenance_id, piece),

    FOREIGN KEY (maintenance_id) REFERENCES Maintenance(intervention_id)

);



CREATE TABLE PrestataireExterne (

    id INTEGER PRIMARY KEY,

    nom VARCHAR(255) NOT NULL,

    contrat TEXT,

    rapportOperation TEXT

);



CREATE TABLE Rapport (

    id INTEGER PRIMARY KEY,

    dateCreation DATE NOT NULL,

    contenu TEXT,

    validation BOOLEAN NOT NULL DEFAULT FALSE,

    renovation_id INTEGER,

    maintenance_id INTEGER,

    prestataire_id INTEGER,

    FOREIGN KEY (renovation_id) REFERENCES Renovation(intervention_id),

    FOREIGN KEY (maintenance_id) REFERENCES Maintenance(intervention_id),

    FOREIGN KEY (prestataire_id) REFERENCES PrestataireExterne(id)

);



CREATE TABLE GestionAdministrative (

    id INTEGER PRIMARY KEY,

    commandeAchat TEXT,

    facturation TEXT,

    validation BOOLEAN NOT NULL DEFAULT FALSE,

    rapport_id INTEGER NOT NULL,

    FOREIGN KEY (rapport_id) REFERENCES Rapport(id)

);



-- Relationship tables for many-to-many relationships

CREATE TABLE UtilisateurRole (

    utilisateur_id INTEGER,

    role_id INTEGER,

    PRIMARY KEY (utilisateur_id, role_id),

    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id),

    FOREIGN KEY (role_id) REFERENCES Role(id)

);



CREATE TABLE UtilisateurIntervention (

    utilisateur_id INTEGER,

    intervention_id INTEGER,

    PRIMARY KEY (utilisateur_id, intervention_id),

    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id),

    FOREIGN KEY (intervention_id) REFERENCES Intervention(id)

);



CREATE TABLE InterventionPlanification (

    intervention_id INTEGER,

    planification_id INTEGER,

    PRIMARY KEY (intervention_id, planification_id),

    FOREIGN KEY (intervention_id) REFERENCES Intervention(id),

    FOREIGN KEY (planification_id) REFERENCES Planification(id)

);



CREATE TABLE UtilisateurPrestataire (

    utilisateur_id INTEGER,

    prestataire_id INTEGER,

    PRIMARY KEY (utilisateur_id, prestataire_id),

    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id),

    FOREIGN KEY (prestataire_id) REFERENCES PrestataireExterne(id)

);



CREATE TABLE UtilisateurGestionAdministrative (

    utilisateur_id INTEGER,

    gestion_id INTEGER,

    PRIMARY KEY (utilisateur_id, gestion_id),

    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id),

    FOREIGN KEY (gestion_id) REFERENCES GestionAdministrative(id)

);