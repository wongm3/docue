describe('Roles Spec', function() {
  'use strict';

  const request = require('supertest');
  const helper = require('./helper');
  const app = require('../index');
  let token = null;

  beforeEach(function(done) {
    // Empty the DB then fill in some dummy data
    helper.clearDb(function() {
      helper.seedRoles(function() {
        helper.seedUsers(function(users) {
          request(app)
            .post('/api/users/login')
            .send({
              username: users[0].username,
              password: users[0].password
            })
            .end(function(err, res) {
              token = res.body.token;
              done();
            });
        });
      });
    });
  });

  describe('Role Creation', function() {
    it('should create a role successfully', function(done) {
      // Try to create an allowed but non-existent role
      request(app)
        .post('/api/roles')
        .send({
          title: 'collaborator',
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .expect(201)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(201);
          expect(res.body.title).toBe('collaborator');
          expect(res.body.id).not.toBeNull();
          done();
        });
    });

    it('should not create a role without a title', function(done) {
      request(app)
        .post('/api/roles')
        .send({
          title: '',
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            'The role title is required');
          done();
        });
    });

    it('should not create a duplicate role', function(done) {
      // Try to create a duplicate role
      request(app)
        .post('/api/roles')
        .send({
          title: 'viewer',
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end(function(err, res) {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(400);
          expect(res.body.title).toBeUndefined();
          expect(res.body.error).toBe('Role already exists');
          done();
        });
    });

    it('should not create an invalid role', function(done) {
      let invalidTitle = 'invalid title';
      request(app)
        .post('/api/roles')
        .send({
          title: invalidTitle,
        })
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .end(function(err, res) {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe(
            invalidTitle + ' is not a valid role title');
          done();
        });
    });

  });

  describe('Get All Roles', function() {
    it('should return all roles', function(done) {
      // The 2 seeded Roles should be returned
      request(app)
        .get('/api/roles')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(res.body.length).toBe(2);
          done();
        });
    });

    it('getAllRoles should return the correct roles', function(done) {
      request(app)
        .get('/api/roles')
        .set('x-access-token', token)
        .end(function(err, res) {
          let allRoles = res.body.map(role => role.title);
          expect(err).toBeNull();
          expect(allRoles[0]).toBe('viewer');
          expect(allRoles[1]).toBe('owner');
          done();
        });
    });

  });

});
