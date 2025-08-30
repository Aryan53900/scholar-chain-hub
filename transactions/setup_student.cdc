import EduChainScholarship from "../contracts/EduChainScholarship.cdc"

transaction(name: String) {
    prepare(signer: AuthAccount) {
        // Check if student already exists
        if signer.borrow<&EduChainScholarship.Student>(from: EduChainScholarship.StudentStoragePath) != nil {
            panic("Student already exists")
        }
        
        // Create new student
        let student <- EduChainScholarship.createStudent(name: name)
        
        // Store student in account storage
        signer.save(<-student, to: EduChainScholarship.StudentStoragePath)
        
        // Create public capability
        signer.link<&{EduChainScholarship.StudentPublic}>(
            EduChainScholarship.StudentPublicPath,
            target: EduChainScholarship.StudentStoragePath
        )
    }
}