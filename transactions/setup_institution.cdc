import EduChainScholarship from "../contracts/EduChainScholarship.cdc"

transaction(name: String) {
    prepare(signer: AuthAccount) {
        // Check if institution already exists
        if signer.borrow<&EduChainScholarship.Institution>(from: EduChainScholarship.InstitutionStoragePath) != nil {
            panic("Institution already exists")
        }
        
        // Create new institution
        let institution <- EduChainScholarship.createInstitution(name: name)
        
        // Store institution in account storage
        signer.save(<-institution, to: EduChainScholarship.InstitutionStoragePath)
        
        // Create public capability
        signer.link<&{EduChainScholarship.InstitutionPublic}>(
            EduChainScholarship.InstitutionPublicPath,
            target: EduChainScholarship.InstitutionStoragePath
        )
    }
}