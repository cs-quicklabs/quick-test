/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import * as request from "supertest";
import { INestApplication, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";
import { AppModule } from '../src/app.module';
import { UserEntity } from "../src/service-users/user/user.entity";
import { UserRepository } from '../src/service-users/user/user.repository';
import { ForgottenPasswordRepository } from "../src/service-users/user/forgotten-passowrd.repository";
import { ForgottenPasswordEntity } from '../src/service-users/user/forgotten-password-reqs.entity';
import { ProjectRepository } from "../src/service-organization/project/project.repository";
import { ProjectEntity } from "../src/service-organization/project/project.entity";
import { SectionRepository } from "../src/service-organization/test-case/section/section.repository";
import { SectionEntity } from "../src/service-organization/test-case/section/section.entity";
import { TestCaseRepository } from "../src/service-organization/test-case/test-case.repository";
import { TestCaseEntity } from "../src/service-organization/test-case/test-case.entity";
import { CustomerRepository } from "../src/service-organization/payment/repositories/customer.repository";
import { InvoiceRepository } from "../src/service-organization/payment/repositories/invoice.repository";
import { SubscriptionRepository } from "../src/service-organization/payment/repositories/subscription.repository";
import { PaymentMethodRepository } from "../src/service-organization/payment/repositories/paymentMethod.repository";
import { CustomerEntity } from "../src/service-organization/payment/entities/customer.entity";
import { InvoiceEntity } from "../src/service-organization/payment/entities/invoice.entity";
import { SubscriptionEntity } from "../src/service-organization/payment/entities/subscription.entity";
import { PaymentMethodEntity } from "../src/service-organization/payment/entities/paymentMethod.entity";
import { EmailVerifyTokenEntity } from "../src/service-users/user/email-verify-token.entity";
import { EmailVerifyTokenRepository } from "../src/service-users/user/email-verify-token.repository";

const mockedUser: any = [
    {
        user: {
            firstName: "temp",
            lastName: "user",
            email: "temp@gmail.com",
            password: "password"
        }, 
        organization: "crownstack"
    }
];

const mockedProject: any = [
    {
        name: "Project 1",
        description: "Project description"
    }
];

const mockedSection: any = [
    {
        name: "Login",
        description: "all login related testcases"
    },
    {
        name: "Register",
        description: "all login register testcases"
    },
    {
        name: "Feed",
        description: "all feed related testcases"
    }
]

describe('Section route e2e test cases', () => {
    let app: INestApplication;
    let userRepository: Repository<UserEntity>;
    let forgottenPasswordRepository: Repository<ForgottenPasswordEntity>;
    let projectRepository: Repository<ProjectEntity>;
    let sectionRepository: Repository<SectionEntity>;
    let testCaseRepository: Repository<TestCaseEntity>;
    let customerRepository: Repository<CustomerEntity>;
    let subscriptionRepository: Repository<SubscriptionEntity>;
    let invoiceRepository: Repository<InvoiceEntity>;
    let paymentMethodRepository: Repository<PaymentMethodEntity>;
    let emailVerifyTokenRepository : Repository<EmailVerifyTokenEntity>;
    let token = null;
    
    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [  AppModule]
        }).compile();
        
        app = moduleRef.createNestApplication();
        await app.init();

        userRepository = await moduleRef.get(UserRepository);       
        forgottenPasswordRepository = await moduleRef.get(ForgottenPasswordRepository);
        projectRepository = await moduleRef.get(ProjectRepository);
        sectionRepository = await moduleRef.get(SectionRepository); 
        testCaseRepository = await moduleRef.get(TestCaseRepository);
        customerRepository = await moduleRef.get(CustomerRepository);
        subscriptionRepository = await moduleRef.get(SubscriptionRepository);
        invoiceRepository = await moduleRef.get(InvoiceRepository);
        paymentMethodRepository = await moduleRef.get(PaymentMethodRepository);
        emailVerifyTokenRepository = await moduleRef.get(EmailVerifyTokenRepository);
    });
    
    beforeAll(async () => {
        await paymentMethodRepository.delete({});
        await invoiceRepository.delete({});
        await subscriptionRepository.delete({});
        await customerRepository.delete({});
        await emailVerifyTokenRepository.delete({});
        await forgottenPasswordRepository.delete({});
        await userRepository.delete({});
        await testCaseRepository.delete({});
        await sectionRepository.delete({});
        await projectRepository.delete({});
    });

    describe("POST /projects/:id/sections", () => {
        it('should create a new section for a project', async () => {
            const { user } = mockedUser[0];
            // create user and login to get token
            await request(app.getHttpServer())
                .post('/auth/register')
                .set('Accept', 'application/json')
                .send(mockedUser[0])
                .expect(HttpStatus.CREATED);

            const newUser = await userRepository.findOne({
                email: user.email
            });
            newUser.isVerified = true;
            await userRepository.save(newUser);

            const { body } = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                    email: mockedUser[0].user.email,
                    password: mockedUser[0].user.password
                })
                .expect(HttpStatus.OK);
            
            token = body?.data?.token?.accessToken;
            
            // create a project
            const projectRes = await request(app.getHttpServer())
                .post('/projects')
                .set('authorization', `Bearer ${token}`)
                .send(mockedProject[0])
                .expect(HttpStatus.CREATED);

            mockedProject[0].id = projectRes?.body?.data?.id;

            const sectionRes = await request(app.getHttpServer())
                .post(`/projects/${mockedProject[0].id}/sections`)
                .set('authorization', `Bearer ${token}`)
                .send(mockedSection[0])
                .expect(HttpStatus.CREATED);
            
            expect(sectionRes?.body?.data).toHaveProperty("id");

            const section = await sectionRepository.findOne({
                id: sectionRes?.body?.data?.id
            });

            expect(sectionRes?.body?.data?.id).toEqual(section.id);
            expect(sectionRes?.body?.data?.name).toEqual(section.name);
            expect(sectionRes?.body?.data?.description).toEqual(section.description);
        });
    });

    describe("Put /projects/:id/sections/:sectionId", () => {
        it('should return error for section name already exists', async () => {
            const section = await sectionRepository.findOne({
                name: mockedSection[0].name
            });
            
            const { body } = await request(app.getHttpServer())
                .put(`/projects/${mockedProject[0].id}/sections/${section.id}`)
                .set('authorization', `Bearer ${token}`)
                .send({
                    name: mockedSection[0].name
                })
                .expect(HttpStatus.BAD_REQUEST);
            
            expect(body.data).toBeNull();
        });
        
        it('should update the section', async () => {
            const section = await sectionRepository.findOne({
                name: mockedSection[0].name
            });

            const { body } = await request(app.getHttpServer())
                .put(`/projects/${mockedProject[0].id}/sections/${section.id}`)
                .set('authorization', `Bearer ${token}`)
                .send({
                    description: ""
                })
                .expect(HttpStatus.OK);
            
            const updatedSection = await sectionRepository.findOne({
                id: section.id
            });

            expect(body?.data?.id).toEqual(updatedSection.id);
            expect(body?.data?.name).toEqual(updatedSection.name);
            expect(body?.data?.description).toEqual(updatedSection.description);
        });
    });

    describe("GET /projects/:id/sections", () => {

        it('should get all the sections for the project', async () => {
            
            await request(app.getHttpServer())
                .post(`/projects/${mockedProject[0].id}/sections`)
                .set('authorization', `Bearer ${token}`)
                .send(mockedSection[1])
                .expect(HttpStatus.CREATED);
            
            await request(app.getHttpServer())
                .post(`/projects/${mockedProject[0].id}/sections`)
                .set('authorization', `Bearer ${token}`)
                .send(mockedSection[2])
                .expect(HttpStatus.CREATED);

            const { body } = await request(app.getHttpServer())
                .get(`/projects/${mockedProject[0].id}/sections`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.OK);

            const createdSections = await sectionRepository.find({
                projectId: mockedProject[0].id
            });
            
            expect(body?.data?.meta?.itemCount).toEqual(createdSections.length);
            
            const sections = body.data.data;
            sections.forEach(section => {
                const checkSection = createdSections.find(createdSection => createdSection.name === section.name);
                expect(checkSection).toBeTruthy();
            });
        });
    });

    describe("DELETE /projects/:id/sections/:sectionId", () => {
        it('should return error for deleting default section', async () => {
            const section = await sectionRepository.findOne({
                name: "Unassigned"
            });

            const { body } = await request(app.getHttpServer())
                .delete(`/projects/${mockedProject[0].id}/sections/${section.id}`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.FORBIDDEN);
            
            expect(body.data).toBeNull();
        });

        it('should return error for section not found', async () => {
            
            const { body } = await request(app.getHttpServer())
                .delete(`/projects/${mockedProject[0].id}/sections/99999999-9156-4c26-9c29-d43cfbe6fff3`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.NOT_FOUND);

            expect(body?.data).toBeNull();
        });

        it('should delete the section', async () => {
            
            const section = await sectionRepository.findOne({
                name: mockedSection[0].name
            });

            expect(section).toHaveProperty("id");

            await request(app.getHttpServer())
                .delete(`/projects/${mockedProject[0].id}/sections/${section.id}`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.OK);
            
            const deletedSection = await sectionRepository.findOne({
                id: section.id
            });

            expect(deletedSection).toBeUndefined();
        });
    });

    afterAll(async () => {
        await paymentMethodRepository.delete({});
        await invoiceRepository.delete({});
        await subscriptionRepository.delete({});
        await customerRepository.delete({});
        await emailVerifyTokenRepository.delete({});
        await forgottenPasswordRepository.delete({});
        await userRepository.delete({});
        await testCaseRepository.delete({});
        await sectionRepository.delete({});
        await projectRepository.delete({});
    });

    afterAll(async () => {
        await app.close();
    });

    afterAll(async () => {
        await new Promise<void>(
            resolve => setTimeout(() => resolve(), 500)
        ); 
    });
});
