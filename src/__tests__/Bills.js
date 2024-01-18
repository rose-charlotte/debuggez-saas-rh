/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            //to-do write expect expression
            expect(windowIcon.className).toBe("active-icon");
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
                .map(a => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
        test(" Then the click on newBill button should open NewBillPage", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            userEvent.click(screen.getByTestId("btn-new-bill"));

            await waitFor(() => screen.getByTestId("form-new-bill"));
        });

        test("Then the click on eye icon should open a modale File", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            //To avoid trouble with the .modal from bootstraps:
            $.fn.modal = jest.fn();

            const iconEyeButton = screen.getAllByTestId("icon-eye");
            userEvent.click(iconEyeButton[0]);

            await waitFor(() => screen.getByText("Justificatif"));
        });
    });

    //Test d'integration fonction GetBills
    describe("Given I am connected as an employee", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills");
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "a@a",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
        });
        describe("When I navigate to Bills", () => {
            test("Then fetches bills from mock API GET", async () => {
                window.onNavigate(ROUTES_PATH.Bills);
                await waitFor(() => screen.getByText("Mes notes de frais"));
                const refusedStatus = screen.getAllByText("refused");
                expect(refusedStatus).toBeTruthy();
                const pendingStatus = screen.getAllByText("pending");
                expect(pendingStatus).toBeTruthy();
            });
        });
        // describe("When an error occurs on API", () => {
        //     test("fetches bills from an API and fails with 404 message error", async () => {

        //     });
        // });
    });
});
