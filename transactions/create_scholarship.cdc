import EduChainScholarship from "../contracts/EduChainScholarship.cdc"

transaction(
    name: String,
    description: String,
    amount: UFix64,
    requirements: [String]
) {
    prepare(signer: AuthAccount) {
        let institutionRef = signer.borrow<&EduChainScholarship.Institution>(
            from: EduChainScholarship.InstitutionStoragePath
        ) ?? panic("Could not borrow institution reference")
        
        let scholarshipId = institutionRef.createScholarship(
            name: name,
            description: description,
            amount: amount,
            requirements: requirements
        )
        
        log("Created scholarship with ID: ".concat(scholarshipId.toString()))
    }
}