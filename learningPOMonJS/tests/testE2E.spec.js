import {test,expect} from '@playwright/test'
import {LoginPage} from "../pages/loginpage.js";
import {InventoryPage} from "../pages/inventorypage.js";
import {CartPage} from "../pages/cartpage.js";
import {CheckoutPage}from '../pages/checkoutpage.js'
import {BASE_URL,CREDENTIALS,CHECKOUT_DATA} from "../pages/config.js";
test("E2E Happy Path", async ({page}) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const cred = CREDENTIALS
    const data = CHECKOUT_DATA
    const itemsToAdd = ["Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
        "Sauce Labs Fleece Jacket",
        "Sauce Labs Onesie",
        "Test.allTheThings() T-Shirt (Red)"];
    const itemsToRemove = ["Test.allTheThings() T-Shirt (Red)",
        "Sauce Labs Onesie"]
    const finalItem = itemsToAdd.filter(item => !itemsToRemove.includes(item));
    await page.goto(BASE_URL);
    await login.login(cred.standard.username, cred.standard.password);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toEqual(itemsToAdd.length)
    const itemPrices = await inventory.getInventoryItemsWithPrices()
    await inventory.goToCart()
    expect(await cart.isOnCartPage()).toBe(true);
    expect(await cart.getCartBadgeCount()).toEqual(itemsToAdd.length);
    for(const item of itemsToRemove) {
        await cart.removeItemFromCart(item);
    }
    expect(await cart.getCartBadgeCount()).toEqual(finalItem.length);
    expect(await cart.getCartItemNames()).toEqual(finalItem);
    await cart.proceedToCheckout()
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.fillPersonalInfo(data.valid.firstName, data.valid.lastName, data.valid.zipCode);
    await checkout.continueToOverview()
    const names = await checkout.getOverviewItemNames();
    expect(await names).toEqual(finalItem);
    const expectedSubTotal = finalItem.reduce((sum, item) => {
        const price = itemPrices.get(item)
        if(price === undefined){
            throw new Error(`Precio no encontrado para "${item}" en itemsPrices (Map)`)
        }
        return sum + price;
    }, 0);
    expect(await checkout.getSubtotal()).toEqual(expectedSubTotal);
    const expectedTax = Number((expectedSubTotal * 0.08).toFixed(2));
    expect(await checkout.getTax()).toEqual(expectedTax);
    const expectedTotal = Number(expectedTax + expectedSubTotal);
    expect(await checkout.getTotal()).toBeCloseTo(expectedTotal, 1);
    await checkout.finishPurchase()
    expect(await checkout.isCompletePage()).toBe(true);
    await checkout.backToProducts()
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await login.logout()
    expect(await login.isOnBasePage()).toBe(true);
})