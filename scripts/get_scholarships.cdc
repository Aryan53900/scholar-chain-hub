import EduChainScholarship from "../contracts/EduChainScholarship.cdc"

pub fun main(institutionAddress: Address): {UInt64: EduChainScholarship.Scholarship} {
    let institutionRef = getAccount(institutionAddress)
        .getCapability(EduChainScholarship.InstitutionPublicPath)
        .borrow<&{EduChainScholarship.InstitutionPublic}>()
        ?? panic("Could not borrow institution reference")
    
    return institutionRef.getScholarships()
}