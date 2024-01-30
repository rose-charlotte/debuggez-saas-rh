/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

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
        test("Then it should render differents labels and  inpusts", () => {
            expect(screen.getByTestId("datepicker")).toBeInTheDocument();
            expect(screen.getByTestId("amount")).toBeInTheDocument();
            expect(screen.getByTestId("pct")).toBeInTheDocument();
            expect(screen.getByTestId("file")).toBeInTheDocument();
            expect(screen.getByLabelText("Justificatif")).toBeInTheDocument();
        });

        test("Then I should  have an error message if the file input is not fulfilled with jpg/jpeg/png", () => {
            uploadFile("txt");

            const fileInput = screen.getByLabelText("Justificatif");
            expect(fileInput.value).toBeFalsy();
        });
    });

    //Test d'integration  post new bill
    describe("When I click on the submit button", () => {
        test("Then I should be redirected on bills page if the form is correctly fulfilled", async () => {
            fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-01-29" } });
            userEvent.type(screen.getByTestId("amount"), "400");
            userEvent.type(screen.getByTestId("pct"), "20");
            uploadFile("jpg");

            verifyFormIsValid();
            userEvent.click(screen.getByText("Envoyer"));

            await waitFor(() => screen.getByText("Mes notes de frais"));
            expect(screen.getByTestId("tbody")).toBeInTheDocument();
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

    const file = new File(["file content"], `toto.${extension}`, {
        type: mimeType,
    });

    // const fileInput = screen.getByLabelText("Justificatif");
    const fileInput = screen.getByTestId("file");
    userEvent.upload(fileInput, file);
}

function verifyFormIsValid() {
    expect(screen.getByTestId("expense-type")).toBeValid();
    expect(screen.getByTestId("expense-name")).toBeValid();
    expect(screen.getByTestId("datepicker")).toBeValid();
    expect(screen.getByTestId("amount")).toBeValid();
    expect(screen.getByTestId("vat")).toBeValid();
    expect(screen.getByTestId("pct")).toBeValid();
    expect(screen.getByTestId("commentary")).toBeValid();
}
