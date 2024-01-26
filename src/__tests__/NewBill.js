/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";

import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        jest.spyOn(mockStore, "bills");
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
        window.onNavigate(ROUTES_PATH.NewBill);
    });

    describe("When I am on NewBill Page", () => {
        describe("When I choose a file to upload", () => {
            test("Then it should render differents labels and  inputs", () => {
                expect(screen.getByTestId("datepicker")).toBeTruthy();
                expect(screen.getByTestId("amount")).toBeTruthy();
                expect(screen.getByTestId("pct")).toBeTruthy();
                expect(screen.getByTestId("file")).toBeTruthy();
                expect(screen.getByLabelText("Justificatif")).toBeTruthy();
            });

            test("Then I should  have an error message if the file input is fulfilled with jpg/jpeg/png", async () => {
                uploadFile("txt");

                const fileInput = screen.getByLabelText("Justificatif");
                expect(fileInput.value).toBeFalsy();
            });
        });

        //Test d'integration  post new bill
        describe("When I click on the submit button", () => {
            test("Then I should be redirected on bills page if the form is correctly fulfilled", async () => {
                userEvent.type(screen.getByTestId("datepicker"), "2004-04-04");
                userEvent.type(screen.getByTestId("amount"), "400");
                userEvent.type(screen.getByTestId("pct"), "20");
                uploadFile("jpg");

                userEvent.click(screen.getByText("Envoyer"));

                await waitFor(() => screen.getByText("Mes notes de frais"));
            });
        });
    });
});

//Allows us to mock the file type of the input:
function uploadFile(extension) {
    let mimeType = "image/jpeg";

    switch (extension) {
        case "txt":
            mimeType = "text/plain";
    }

    const someValues = [{ name: "toto" }];
    const str = JSON.stringify(someValues);
    const blob = new Blob([str]);
    const file = new File([blob], `toto.${extension}`, {
        type: mimeType,
    });

    const fileInput = screen.getByLabelText("Justificatif");
    userEvent.upload(fileInput, file);
}
