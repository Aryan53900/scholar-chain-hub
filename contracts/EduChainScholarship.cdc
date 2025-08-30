import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61

pub contract EduChainScholarship {
    
    // Events
    pub event ScholarshipCreated(id: UInt64, amount: UFix64, institution: Address)
    pub event ApplicationSubmitted(scholarshipId: UInt64, applicant: Address)
    pub event ApplicationApproved(scholarshipId: UInt64, applicant: Address, amount: UFix64)
    pub event FundsDistributed(scholarshipId: UInt64, recipient: Address, amount: UFix64)
    
    // Paths
    pub let InstitutionStoragePath: StoragePath
    pub let InstitutionPublicPath: PublicPath
    pub let StudentStoragePath: StoragePath
    pub let StudentPublicPath: PublicPath
    
    // Total scholarships created
    pub var totalScholarships: UInt64
    
    // Scholarship struct
    pub struct Scholarship {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let amount: UFix64
        pub let institution: Address
        pub let requirements: [String]
        pub var isActive: Bool
        pub var applicants: [Address]
        pub var approved: [Address]
        
        init(
            id: UInt64,
            name: String,
            description: String,
            amount: UFix64,
            institution: Address,
            requirements: [String]
        ) {
            self.id = id
            self.name = name
            self.description = description
            self.amount = amount
            self.institution = institution
            self.requirements = requirements
            self.isActive = true
            self.applicants = []
            self.approved = []
        }
        
        pub fun addApplicant(applicant: Address) {
            if !self.applicants.contains(applicant) {
                self.applicants.append(applicant)
            }
        }
        
        pub fun approveApplicant(applicant: Address) {
            if self.applicants.contains(applicant) && !self.approved.contains(applicant) {
                self.approved.append(applicant)
            }
        }
        
        pub fun deactivate() {
            self.isActive = false
        }
    }
    
    // Institution Resource
    pub resource Institution {
        pub let id: UInt64
        pub var name: String
        pub var scholarships: {UInt64: Scholarship}
        pub let vault: @FlowToken.Vault
        
        init(name: String) {
            self.id = self.uuid
            self.name = name
            self.scholarships = {}
            self.vault <- FlowToken.createEmptyVault()
        }
        
        pub fun createScholarship(
            name: String,
            description: String,
            amount: UFix64,
            requirements: [String]
        ): UInt64 {
            let scholarshipId = EduChainScholarship.totalScholarships
            let scholarship = Scholarship(
                id: scholarshipId,
                name: name,
                description: description,
                amount: amount,
                institution: self.owner?.address!,
                requirements: requirements
            )
            
            self.scholarships[scholarshipId] = scholarship
            EduChainScholarship.totalScholarships = EduChainScholarship.totalScholarships + 1
            
            emit ScholarshipCreated(
                id: scholarshipId,
                amount: amount,
                institution: self.owner?.address!
            )
            
            return scholarshipId
        }
        
        pub fun approveApplication(scholarshipId: UInt64, applicant: Address) {
            pre {
                self.scholarships.containsKey(scholarshipId): "Scholarship does not exist"
            }
            
            let scholarship = &self.scholarships[scholarshipId] as &Scholarship
            scholarship.approveApplicant(applicant: applicant)
            
            emit ApplicationApproved(
                scholarshipId: scholarshipId,
                applicant: applicant,
                amount: scholarship.amount
            )
        }
        
        pub fun distributeFunds(scholarshipId: UInt64, recipient: Address) {
            pre {
                self.scholarships.containsKey(scholarshipId): "Scholarship does not exist"
            }
            
            let scholarship = &self.scholarships[scholarshipId] as &Scholarship
            
            if scholarship.approved.contains(recipient) {
                let recipientRef = getAccount(recipient)
                    .getCapability(/public/flowTokenReceiver)
                    .borrow<&{FungibleToken.Receiver}>()
                    ?? panic("Could not borrow recipient's Vault reference")
                
                let payment <- self.vault.withdraw(amount: scholarship.amount)
                recipientRef.deposit(from: <-payment)
                
                emit FundsDistributed(
                    scholarshipId: scholarshipId,
                    recipient: recipient,
                    amount: scholarship.amount
                )
            }
        }
        
        pub fun depositFunds(vault: @FungibleToken.Vault) {
            self.vault.deposit(from: <-vault)
        }
        
        pub fun getScholarships(): {UInt64: Scholarship} {
            return self.scholarships
        }
        
        destroy() {
            destroy self.vault
        }
    }
    
    // Student Resource
    pub resource Student {
        pub let id: UInt64
        pub var name: String
        pub var appliedScholarships: [UInt64]
        pub var approvedScholarships: [UInt64]
        
        init(name: String) {
            self.id = self.uuid
            self.name = name
            self.appliedScholarships = []
            self.approvedScholarships = []
        }
        
        pub fun applyForScholarship(scholarshipId: UInt64, institutionAddress: Address) {
            let institutionRef = getAccount(institutionAddress)
                .getCapability(EduChainScholarship.InstitutionPublicPath)
                .borrow<&{InstitutionPublic}>()
                ?? panic("Could not borrow institution reference")
            
            institutionRef.receiveApplication(
                scholarshipId: scholarshipId,
                applicant: self.owner?.address!
            )
            
            if !self.appliedScholarships.contains(scholarshipId) {
                self.appliedScholarships.append(scholarshipId)
            }
            
            emit ApplicationSubmitted(
                scholarshipId: scholarshipId,
                applicant: self.owner?.address!
            )
        }
        
        pub fun addApprovedScholarship(scholarshipId: UInt64) {
            if !self.approvedScholarships.contains(scholarshipId) {
                self.approvedScholarships.append(scholarshipId)
            }
        }
        
        pub fun getAppliedScholarships(): [UInt64] {
            return self.appliedScholarships
        }
        
        pub fun getApprovedScholarships(): [UInt64] {
            return self.approvedScholarships
        }
    }
    
    // Public Interfaces
    pub resource interface InstitutionPublic {
        pub fun receiveApplication(scholarshipId: UInt64, applicant: Address)
        pub fun getScholarships(): {UInt64: Scholarship}
    }
    
    pub resource interface StudentPublic {
        pub fun getAppliedScholarships(): [UInt64]
        pub fun getApprovedScholarships(): [UInt64]
    }
    
    // Public functions
    pub fun createInstitution(name: String): @Institution {
        return <-create Institution(name: name)
    }
    
    pub fun createStudent(name: String): @Student {
        return <-create Student(name: name)
    }
    
    pub fun getAllScholarships(): {Address: {UInt64: Scholarship}} {
        let scholarships: {Address: {UInt64: Scholarship}} = {}
        // This would require a registry of all institutions
        // For now, return empty - in practice, you'd maintain a registry
        return scholarships
    }
    
    init() {
        self.totalScholarships = 0
        
        self.InstitutionStoragePath = /storage/EduChainInstitution
        self.InstitutionPublicPath = /public/EduChainInstitution
        self.StudentStoragePath = /storage/EduChainStudent
        self.StudentPublicPath = /public/EduChainStudent
    }
}