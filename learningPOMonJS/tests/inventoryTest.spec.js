import {test, expect} from "@playwright/test";
import {LoginPage} from "../pages/loginpage.js";
import {InventoryPage} from "../pages/inventorypage.js";
import {CartPage} from "../pages/cartpage.js";
import {BASE_URL, CREDENTIALS} from "../pages/config.js";
const nameAndBriefDescription = [
    {name: "Sauce Labs Backpack", description: "Sly Pack"},
    {name: "Sauce Labs Bike Light", description: "AAA battery included"},
    {name: "Sauce Labs Bolt T-Shirt", description: "American Apparel"},
    {name: "Sauce Labs Fleece Jacket", description: "quarter-zip fleece jacket"},
    {name: "Sauce Labs Onesie", description: " two-needle hemmed"},
    {name: "Test.allTheThings() T-Shirt (Red)", description: "Super-soft and comfy"},
]
test.describe('Inventory page Tests - Standard User',() => {
    test.beforeEach(async ({page}) => {
        const login = new LoginPage(page);
        const cred = CREDENTIALS
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await login.login(cred.standard.username, cred.standard.password);
        expect(await login.isLoginOk()).toBe(true);
    })

test('Add one product', async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.addItemToCart('Sauce Labs Backpack');
    expect(await inventory.getCartBadgeCount()).toBe(1);
    expect(await inventory.isRemoveButtonVisible('Sauce Labs Backpack')).toBe(true);
})
test('Add multiple products', async ({page}) => {
    const inventory = new InventoryPage(page);
    const itemsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Onesie"];
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length);
    for(const item of itemsToAdd) {
        expect(await inventory.isRemoveButtonVisible(item)).toBe(true);
    }
})
test('Add to products, remove one', async ({page}) => {
    const inventory = new InventoryPage(page);
    const itemsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length);
    for(const item of itemsToAdd) {
        expect(await inventory.isRemoveButtonVisible(item)).toBe(true);
    }
    await inventory.removeItemFromCart("Sauce Labs Backpack");
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length-1);
})
test('Add/Remove all products', async ({page}) => {
    const inventory = new InventoryPage(page);
    const itemsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt", "Sauce Labs Fleece Jacket", "Sauce Labs Onesie", "Test.allTheThings() T-Shirt (Red)"];
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length);
    for(const item of itemsToAdd) {
        expect(await inventory.isRemoveButtonVisible(item)).toBe(true);
        await inventory.removeItemFromCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(0);
})
test('Consistency across pages', async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const itemsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt"];
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length);
    await inventory.goToCart()
    expect(await cart.isOnCartPage()).toBe(true);
    expect(await cart.getCartItemNames()).toEqual(itemsToAdd);
    await cart.continueShopping()
    for (const item of itemsToAdd) {
        await inventory.removeItemFromCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(0);
    await inventory.goToCart()
    expect(await cart.getCartItemNames()).not.toEqual(itemsToAdd);
})
test("Product Description is Correct", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.getProductDescription('Sauce Labs Backpack')).toContain('Sly Pack')
})
test.describe("All Product Description is Correct", async () => {
    for(const {name, description} of nameAndBriefDescription){
        test(`Shows ${description} on ${name}`, async ({page}) => {
            const inventory = new InventoryPage(page);
            expect(await inventory.getProductDescription(name)).toContain(description);
        })
    }
})
test("Inventory sorting - Name (A to Z) works correctly", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.selectSortOption('az');
    const actualNames = await inventory.getProductNames();
    const expectedNames = [...actualNames].sort();
    expect(actualNames).toEqual(expectedNames);
})
test("Inventory Sorting - Name (Z to A) works correctly ", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.selectSortOption('za');
    const actualNames = await inventory.getProductNames();
    const expectedNames = [...actualNames].sort((a, b) => b.localeCompare(a)); // esta es la forma de verificar el sort contrario al orden alfabético
    expect(actualNames).toEqual(expectedNames);
})
test("Inventory Sorting - Price (Low to High) works correctly", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.selectSortOption('lohi');
    const prices = await inventory.getProductPrices();
    const expectedPrices = [... prices].sort((a,b) => a - b); //asi es el ascendente, espero que recuerdes que lo comentaste aquí
    expect(prices).toEqual(expectedPrices);
})
test("Inventory Sorting - Price (High to Low) works correctly", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.selectSortOption('hilo');
    const prices = await inventory.getProductPrices();
    const expectedPrices = [... prices].sort((a,b) => b - a); //asi es el descendente, espero que recuerdes que lo comentaste aquí
    expect(prices).toEqual(expectedPrices);
})
test("Sorting preserve Items Names and Prices", async ({ page }) => {
    const inventory = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory/);

    const initial = await inventory.getInventoryItemsWithPrices();

    for (const opt of ["az", "za", "lohi", "hilo"]) {
        await inventory.selectSortOption(opt);
        const current = await inventory.getInventoryItemsWithPrices();

        expect(current.size).toBe(initial.size);

        const namesBefore = Array.from(initial.keys()).sort();
        const namesAfter  = Array.from(current.keys()).sort();
        expect(namesAfter).toEqual(namesBefore);

        for (const [name, price] of initial) {
            expect(current.get(name)).toBe(price);
        }
    }
});
test("Sorting preserves cart status and add/remove button", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    expect(await inventory.getCartBadgeCount()).toBe(0);
    await inventory.addItemToCart("Sauce Labs Backpack");
    expect(await inventory.getCartBadgeCount()).toBe(1);
    await inventory.selectSortOption('za');
    const names = await inventory.getProductNames();
    expect(await inventory.isRemoveButtonVisible("Sauce Labs Backpack")).toBe(true);
    const expectedNames = [...names].sort((a, b) => b.localeCompare(a));
    expect(names, `Z to A Fallo: ${names} != ${expectedNames}`).toEqual(expectedNames);
    expect(await inventory.getCartBadgeCount()).toBe(1);
    expect(await inventory.isRemoveButtonVisible("Sauce Labs Backpack")).toBe(true);
    await inventory.removeItemFromCart("Sauce Labs Backpack");
    expect(await inventory.getCartBadgeCount()).toBe(0);
    await inventory.selectSortOption('az');
    const expectedNamesP2 = [...names].sort();
    expect(names).not.toEqual(expectedNamesP2);
    await inventory.selectSortOption('za')
    const expectedNamesP3 = [...names].sort((a,b)=> b.localeCompare(a));
    expect(names).toEqual(expectedNamesP3);
    expect(await inventory.isAddButtonVisible("Sauce Labs Backpack")).toBe(true);
})
test("Reset App Happy Path", async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const itemsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt"];
    expect(await inventory.getCartBadgeCount()).toBe(0);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length);
    for(const item of itemsToAdd) {
        expect(await inventory.isRemoveButtonVisible(item)).toBe(true);
    }
    await inventory.resetApp()
    expect(await inventory.getCartBadgeCount(), 'Reset does not change status on cart badge').toBe(0);
    await inventory.goToCart()
    expect(await cart.isOnCartPage()).toBe(true);
    expect(await cart.isCartEmpty()).toBe(true);
    expect(await cart.getCartItemNames()).toEqual([])
    await cart.continueShopping()
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of itemsToAdd) {
        expect(await inventory.isRemoveButtonVisible(item)).toBe(false);
    }
    `When you go to cart page after click reset app, to check if the cart is already empty 
    then when you go to the inventory page the UI update the status on the remove/add button.`
})
test.fail("Reset App (Known bug)", async ({page}) => {
    const inventory = new InventoryPage(page);
    const itemsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt"];
    expect(await inventory.getCartBadgeCount()).toBe(0);
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(itemsToAdd.length);
    await inventory.resetApp()
    expect(await inventory.getCartBadgeCount()).toBe(0);
    for(const item of itemsToAdd) {
        expect(await inventory.isRemoveButtonVisible(item)).toBe(false);
    }
    `Actually this test have a bug on it, it supposes to change the status on the remove button
    and the badge count of the cart, restarting the status at the initial status, but it does not happen
    just change the status on the cart badge but the status on the remove buttons never change`
})
test("About Link Works", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.goToAboutPage()).toBe(true);
})
});
test.fail("Add/Remove On Problem User(Known bug)", async ({page}) => {
    const inventory = new InventoryPage(page);
    const login = new LoginPage(page);
    const cart = new CartPage(page);
    const cred = CREDENTIALS
    const allItems = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
        "Sauce Labs Fleece Jacket",
        "Sauce Labs Onesie",
        "Test.allTheThings() T-Shirt (Red)"]
    const addableItems = ["Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Onesie"]
    await page.goto(BASE_URL)
    await login.login(cred.problem.username, cred.problem.password)
    expect(await inventory.isOnInventoryPage()).toBe(true);
    for(const item of allItems){
        const wasAddBtnBefore = await inventory.isAddButtonVisible(item)
        expect(wasAddBtnBefore, `No se ve boton add para ${item}`).toBe(true);
        await inventory.addItemToCart(item)
        await page.waitForTimeout(500);
        const isRemoveNow = await inventory.isRemoveButtonVisible(item)
        const isAddStill =await inventory.isAddButtonVisible(item)
        if(addableItems.includes(item)){
            expect(isRemoveNow, `No cambió a Remove después de agregar "${item}"`).toBe(true);
            expect(isAddStill, `Sigue visible Add después de agregar "${item}"`).toBe(false);
            console.log(`OK: "${item}" → agregado correctamente`);
        }else{expect(isRemoveNow, `Apareció Remove en ítem NO agregable "${item}"`).toBe(false);
            expect(isAddStill, `Desapareció Add en ítem NO agregable "${item}"`).toBe(true);
            console.log(`OK: "${item}" → no se pudo agregar (esperado)`);
        }
    }
    expect(await inventory.getCartBadgeCount()).toBe(addableItems.length);
    for(const item of addableItems){
        await inventory.removeItemFromCart(item);
        expect(await inventory.isAddButtonVisible(item)).toBe(true);
    }
    await inventory.goToCart()
    expect(await cart.getCartItemNames()).toEqual(addableItems);
    `Expected bugs in problem_user: limited add, no remove from inventory`
})
test("Sorting in Visual User(Known bug)", async ({page}) => {
    const inventory = new InventoryPage(page);
    const login = new LoginPage(page);
    const cred = CREDENTIALS
    await page.goto(BASE_URL)
    await login.login(cred.visual.username, cred.visual.password)
    expect(await inventory.isOnInventoryPage()).toBe(true);
    const initialData = await inventory.getInventoryItemsWithPrices();
    const initialPriceList = await inventory.getProductPrices();
    const sortOptions = ["az", "za", "lohi", "hilo"];
    for(const opt of sortOptions){
        await inventory.selectSortOption(opt)
        const currentData = await inventory.getInventoryItemsWithPrices()
        const currentPriceList = await inventory.getProductPrices();
        const initialKeys = new Set(initialData.keys())
        const currentKeys = new Set(currentData.keys())
        if(initialKeys.size !== currentKeys.size || !setsAreEqual(initialKeys, currentKeys)){
            const missing = difference(initialKeys, currentKeys);
            const extra = difference(currentKeys, initialKeys);
            if(missing.size > 0){
                console.log(`  → Items LOST after sort: ${Array.from(missing).join(", ")}`);
            }
            if(extra.size > 0){
                console.log(`  → Extra items appeared: ${Array.from(extra).join(", ")}`);
            }
        }
        let changesFound = false;
        console.log("  Cambios detectados en precios:");
        for(const name of initialKeys){
            const initialPrice = initialData.get(name);
            const currentPrice = currentData.get(name);
            if(initialPrice !== currentPrice){
                changesFound = true;
                console.log(`    - ${name}: ${initialPrice} → ${currentPrice}  (has changed!)`);
            }
        }
        if (!changesFound){
            console.log("    (Ningún precio cambió en este sort – inesperado si es bug)");
        }
        if(opt === 'lohi' || opt === 'hilo'){
            const expectedSortedPrices = opt === "lohi"
                ? [...initialPriceList].sort((a, b) => a - b)
                : [...initialPriceList].sort((a, b) => b - a);
            const pricesMatch = arraysAreEqual(currentPriceList, expectedSortedPrices);
            if(pricesMatch){
                console.log("  → Precios se ordenaron correctamente (NO esperado en visual_user)");
            } else{
                console.log("  → Precios NO se ordenaron correctamente (expected bug)");
                console.log(`     Lista actual:   ${currentPriceList.join(", ")}`);
                console.log(`     Lista esperada: ${expectedSortedPrices.join(", ")}`);
            }
        }
    }
    console.log("\nTest finalizado. En visual_user se esperan cambios/rupturas en precios con cada sort.");
});
function setsAreEqual(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (const item of setA) {
        if (!setB.has(item)) return false;
    }
    return true;
}
function difference(setA, setB) {
    const diff = new Set(setA);
    for (const elem of setB) {
        diff.delete(elem);
    }
    return diff;
}
function arraysAreEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}