import EduChainScholarship from "../contracts/EduChainScholarship.cdc"

transaction(scholarshipId: UInt64, institutionAddress: Address) {
    prepare(signer: AuthAccount) {
        let studentRef = signer.borrow<&EduChainScholarship.Student>(
            from: EduChainScholarship.StudentStoragePath
        ) ?? panic("Could not borrow student reference")
        
        studentRef.applyForScholarship(
            scholarshipId: scholarshipId,
            institutionAddress: institutionAddress
        )
        
        log("Applied for scholarship ID: ".concat(scholarshipId.toString()))
    }
}