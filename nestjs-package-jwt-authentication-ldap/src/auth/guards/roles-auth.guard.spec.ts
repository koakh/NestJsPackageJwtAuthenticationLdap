import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { RolesAuthGuard } from '.';

describe('RolesAuthGuard', () => {
    let rolesAuthGuard: RolesAuthGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [], // Add
            controllers: [], // Add
            providers: [RolesAuthGuard, Reflector],   // Add
        }).compile();

        rolesAuthGuard = moduleRef.get<RolesAuthGuard>(RolesAuthGuard);
        reflector = moduleRef.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(rolesAuthGuard).toBeDefined();
    });

    describe('RolesAuthGuard', () => {
        it('RolesAuthGuard canActivate - True', () => {
            const context = {
                user: {
                    userId: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
                    username: 'c3',
                    roles: [
                        'C3_ADMINISTRATOR',
                        'C3_TEACHER',
                        'C3_PARENT',
                        'C3_STUDENT',
                        'DOMAIN_ADMINS',
                    ],
                }
            };
            const mockExecutionContext = createMock<ExecutionContext>();
            mockExecutionContext.switchToHttp().getRequest.mockReturnValue(context);
            const spyReflector = ['C3_ADMINISTRATOR'];
            jest
                .spyOn(reflector, 'get')
                .mockImplementationOnce(() => spyReflector);
            expect(mockExecutionContext.switchToHttp()).toBeDefined();
            expect(rolesAuthGuard.canActivate(mockExecutionContext)).toBeTruthy();
        });

        it('RolesAuthGuard canActivate without roles - False', () => {
            const context = {
                user: {
                    userId: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
                    username: 'c3',
                    roles: [
                        'C3_ADMINISTRATOR',
                        'C3_TEACHER',
                        'C3_PARENT',
                        'C3_STUDENT',
                        'DOMAIN_ADMINS',
                    ],
                }
            };
            const mockExecutionContext = createMock<ExecutionContext>();
            mockExecutionContext.switchToHttp().getRequest.mockReturnValue(context);
            const spyReflector = [];
            jest
                .spyOn(reflector, 'get')
                .mockImplementationOnce(() => spyReflector);
            expect(mockExecutionContext.switchToHttp()).toBeDefined();
            expect(rolesAuthGuard.canActivate(mockExecutionContext)).toBeFalsy();
        });

        it('RolesAuthGuard canActivate without user response - False', () => {
            const context = {};
            const mockExecutionContext = createMock<ExecutionContext>();
            mockExecutionContext.switchToHttp().getRequest.mockReturnValue(context);
            const spyReflector = ['C3_ADMINISTRATOR'];
            jest
                .spyOn(reflector, 'get')
                .mockImplementationOnce(() => spyReflector);
            expect(mockExecutionContext.switchToHttp()).toBeDefined();
            expect(rolesAuthGuard.canActivate(mockExecutionContext)).toBeFalsy();
        });

        it('RolesAuthGuard canActivate (user without role) - True', () => {
            const context = {
                user: {
                    userId: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
                    username: 'c3',
                    roles: [
                        'C3_TEACHER',
                        'C3_PARENT',
                        'C3_STUDENT',
                        'DOMAIN_ADMINS',
                    ],
                }
            };
            const mockExecutionContext = createMock<ExecutionContext>();
            mockExecutionContext.switchToHttp().getRequest.mockReturnValue(context);
            const spyReflector = ['C3_ADMINISTRATOR'];
            jest
                .spyOn(reflector, 'get')
                .mockImplementationOnce(() => spyReflector);
            expect(mockExecutionContext.switchToHttp()).toBeDefined();
            expect(rolesAuthGuard.canActivate(mockExecutionContext)).toBeFalsy();
        });
    });
});
