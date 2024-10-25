export class DarkWeb {

    clickDarkWebSettings() {
        cy.get(':nth-child(10) > .no-active > :nth-child(5) > .item-submenu')
            .find('.sidebar-submenu-row').click({ force: true })
    }

    addMultipleSearchWord(){
        cy.get('.icon-plus').eq(2).click()
        cy.get('.form-control').clear().type('apple{enter}')
        cy.get('.form-control').type('bbva')
        cy.contains('Add').click()
    }
}