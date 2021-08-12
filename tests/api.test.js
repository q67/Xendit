/* eslint-disable consistent-return */
/* eslint-disable no-undef */

'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /docs', () => {
        it('should return json docs', (done) => {
            request(app)
                .get('/docs')
                .expect('Content-Type', /json/, done);
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        const defaultRide = {
            start_lat: 0,
            start_long: 0,
            end_lat: 0,
            end_long: 0,
            rider_name: 'Victor',
            driver_name: 'Alex',
            driver_vehicle: 'Renault',
        };

        const requestRide = (key, newVal, done) => {
            const instanseRide = { ...defaultRide };
            instanseRide[key] = newVal;
            request(app)
                .post('/rides')
                .send(instanseRide)
                .expect((res) => {
                    if (res.body.error_code !== 'VALIDATION_ERROR') {
                        throw new Error();
                    }
                })
                .end(done);
        };

        it('should be return validation error if start coordinates not correct', (done) => {
            requestRide('start_lat', -100, done);
        });

        it('should be return validation error if end coordinates not correct', (done) => {
            requestRide('end_lat', 200, done);
        });

        it('should be return validation error if rider name not string', (done) => {
            requestRide('rider_name', 123, done);
        });

        it('should be return validation error if driver name not string', (done) => {
            requestRide('driver_name', 987, done);
        });

        it('should be return validation error if vehicle name not string', (done) => {
            requestRide('driver_vehicle', 756, done);
        });
    });
});
