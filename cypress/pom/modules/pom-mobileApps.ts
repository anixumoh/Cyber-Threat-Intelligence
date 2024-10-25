export class MobileApps {

    clickMobileAppsSettings() {
        cy.get(':nth-child(16) > .no-active > :nth-child(4) > .item-submenu')
            .find('.sidebar-submenu-row').click({ force: true })
    }

    addMultipleSearchWord() {
        cy.get('.icon-plus').click()
        cy.get('.form-control').clear().type('Gym{enter}')
        cy.get('.form-control').type('food')
        cy.contains('Add').click()
    }

    addBadSearchWord() {
        cy.get('.icon-plus').click()
        cy.get('.form-control').type('as')
        cy.contains('Add').click()
    }

    checkUncheckMarket() {
        cy.get('.bg-light.p-2').find('.form-check-input').eq(1).uncheck()
        cy.get('.bg-light.p-2').find('.form-check-input').eq(0).uncheck()
        cy.get('.bg-light.p-2').find('.form-check-input').eq(1).check()
        cy.get('.bg-light.p-2').find('.form-check-input').eq(0).check()
    }
}
const addSearchWord = () => {
    cy.get('.icon-plus').click()
    cy.get('.form-control').type('Gym')
    cy.contains('Add').click()
}

export{
    addSearchWord
}