import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.Request = class Request {
    constructor(input, init) {
        this.input = input;
        this.init = init;
        this.method = init?.method || 'GET';
        this.body = init?.body;
        this.headers = new Headers(init?.headers);
    }

    async json() {
        if (this.init?.body === 'invalid json') {
            throw new Error('Invalid JSON');
        }
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
};

global.Response = class Response {
    constructor(body, init) {
        this.body = body;
        this.init = init;
        this.status = init?.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
};

global.Headers = class Headers extends Map {
    constructor(init) {
        super();
        if (init) {
            Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
    }
};

jest.mock('next/server', () => {
    return {
        NextResponse: {
            json: (data, init) => {
                const response = new Response(JSON.stringify(data), init);
                Object.defineProperty(response, 'status', {
                    get() {
                        return init?.status || 200;
                    }
                });
                return response;
            }
        },
        NextRequest: class extends global.Request {
            constructor(input, init) {
                super(input, init);
                this.json = async () => {
                    if (init?.body === 'invalid json') {
                        throw new Error('Invalid JSON');
                    }
                    return JSON.parse(init?.body || '{}');
                };
            }
        }
    };
});