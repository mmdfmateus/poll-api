import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";

export class LogControllerDecorator implements Controller {
    private readonly controller: Controller;

    constructor(controller: Controller) {
        this.controller = controller;
    }

    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        const response = this.controller.handle(httpRequest);

        return response;
    }
}