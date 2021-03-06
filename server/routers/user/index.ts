import { z } from 'zod';
import { prisma } from '@clients/prisma';
import { createRouter } from '../../createRouter';
import { UserFish, UserPlant } from '@prisma/client';
import { Input } from '@chakra-ui/react';

export const userRouter = createRouter()
	.query('fish', {
		input: z.object({
			id: z.string().cuid(),
		}),
		async resolve({ input }) {
			const fish = await prisma.userFish.findMany({
				where: {
					user_id: input.id,
				},
			});
			return {
				fish,
			};
		},
	})
	.mutation('addFish', {
		input: z.object({
			fish: z.array(
				z.object({
					name: z.string().min(1).max(255),
					fish_id: z.string().cuid(),
					user_id: z.string().cuid(),
					tank_id: z.string().cuid(),
					image_url: z.string(),
				})
			),
		}),
		async resolve({ input }) {
			const readyFish = input.fish.map((fish) => {
				return {
					...fish,
					next_update: new Date().toISOString(),
				};
			});

			return {
				fish: await prisma.userFish.createMany({
					data: readyFish,
				}),
			};
		},
	})
	.mutation('deleteFish', {
		input: z.object({ id: z.string().cuid() }),
		async resolve({ input }) {
			await prisma.userFish.delete({
				where: {
					id: input.id,
				},
			});

			return {
				status: 202,
			};
		},
	})
	.mutation('updateFish', {
		input: z.object({
			id: z.string().cuid(),
			name: z.string().min(1).max(255).optional(),
			next_update: z.string(),
		}),
		async resolve({ input }) {
			await prisma.userFish.update({
				where: {
					id: input.id,
				},
				data: {
					name: input?.name,
					next_update: input.next_update,
				},
			});

			return {
				status: 200,
			};
		},
	})
	.query('tanks', {
		async resolve() {
			const tanks = await prisma.tank.findMany();
			return {
				tanks,
			};
		},
	})
	.query('tanks.byId', {
		input: z.object({
			id: z.string().cuid(),
		}),
		async resolve({ input }) {
			const tank = await prisma.tank.findFirst({
				where: {
					id: input.id,
				},
			});

			const userFish = await prisma.userFish.findMany({
				where: {
					tank_id: input.id,
				},
			});

			const fish = await Promise.all(
				userFish.map(async (f: UserFish) => {
					const parentFish = await prisma.fish.findFirst({
						where: {
							id: f.fish_id,
						},
					});

					return {
						...f,
						species: parentFish?.species,
					};
				})
			);

			const userPlant = await prisma.userPlant.findMany({
				where: {
					tank_id: input.id,
				},
			});

			const plants = await Promise.all(
				userPlant.map(async (p: UserPlant) => {
					const parentPlant = await prisma.plant.findFirst({
						where: {
							id: p.plant_id,
						},
					});

					return {
						...p,
						species: parentPlant?.species,
					};
				})
			);

			return {
				tank,
				fish,
				plants,
			};
		},
	})
	.mutation('addTank', {
		input: z.object({
			id: z.string().cuid(),
			user_id: z.string().cuid(),
			image: z.string().optional(),
			name: z.string().min(1).max(255),
			type: z.string().min(1).max(255),
			ammonia: z.number().min(0).max(6).optional(),
			nirate: z.number().min(0).max(300).optional(),
			nirite: z.number().min(0).max(100).optional(),
			hardness: z.number().min(0).max(400).optional(),
			chlorine: z.number().min(0).max(20).optional(),
			alkalinity: z.number().min(0).max(400).optional(),
			pH: z.number().min(6).max(14).optional(),
			Fish: z
				.array(
					z.object({
						id: z.string().uuid(),
						user_id: z.string().cuid().optional(),
						tank_id: z.string().cuid().optional(),
						name: z.string().min(1).max(255),
						image_url: z.string().min(1).max(255),
						habitat: z.string().min(1).max(255),
						species: z.string().min(1).max(255),
						tank_sizes: z.string().min(1).max(255),
						illnesses: z.string().min(1).max(255),
						diet: z.string().min(1).max(255),
						tank_friends: z.string().min(1).max(255),
						water_params: z.object({
							ammonia: z.number().min(0).max(6),
							nirate: z.number().min(0).max(300),
							nirite: z.number().min(0).max(100),
							hardness: z.number().min(0).max(400),
							chlorine: z.number().min(0).max(20),
							alkalinity: z.number().min(0).max(400),
							pH: z.number().min(6).max(14),
							type: z.string().min(1).max(255),
						}),
					})
				)
				.optional(),
			Plant: z
				.array(
					z.object({
						id: z.string().uuid(),
						user_id: z.string().cuid().optional(),
						name: z.string().min(1).max(255),
						tank_id: z.string().cuid().optional(),
						image_url: z.string().min(1).max(255),
						species: z.string().min(1).max(255),
						lighting: z.string().min(1).max(255),
						soil: z.string().min(1).max(255),
						water_params: z.object({
							ammonia: z.number().min(0).max(6),
							nirate: z.number().min(0).max(300),
							nirite: z.number().min(0).max(100),
							hardness: z.number().min(0).max(400),
							chlorine: z.number().min(0).max(20),
							alkalinity: z.number().min(0).max(400),
							pH: z.number().min(6).max(14),
						}),
						illnesses: z.string().min(1).max(255),
					})
				)
				.optional(),
		}),
		async resolve({ input }) {
			return {
				tank: await prisma.tank.create({
					data: {
						...input,
						image: input.image || '',
						created_at: new Date(),
						updated_at: new Date(),
					},
				}),
			};
		},
	})
	.mutation('updateTank', {
		input: z.object({
			id: z.string().cuid(),
			name: z.string().min(1).max(255).optional(),
			type: z.string().min(1).max(255).optional(),
			image: z.string().optional(),
			ammonia: z.number().min(0).max(6).optional(),
			nirate: z.number().min(0).max(300).optional(),
			nirite: z.number().min(0).max(100).optional(),
			hardness: z.number().min(0).max(400).optional(),
			chlorine: z.number().min(0).max(20).optional(),
			alkalinity: z.number().min(0).max(400).optional(),
			pH: z.number().min(6).max(14).optional(),
			Fish: z
				.array(
					z.object({
						id: z.string().cuid(),
					})
				)
				.optional(),
			Plant: z
				.array(
					z.object({
						id: z.string().cuid(),
					})
				)
				.optional(),
		}),
		async resolve({ input }) {
			await prisma.tank.update({
				where: {
					id: input.id,
				},
				data: {
					...input,
					updated_at: new Date(),
					maintained_at: new Date(),
					Fish: {
						set: input.Fish,
					},
					Plant: {
						set: input.Plant,
					},
				},
			});

			return {
				status: 201,
			};
		},
	})
	.mutation('deleteTank', {
		input: z.object({
			id: z.string().cuid(),
			isRemovingFish: z.boolean(),
			removedFish: z.array(z.string().cuid()).optional(),
			isRemovingPlants: z.boolean(),
			removedPlants: z.array(z.string().cuid()).optional(),
		}),
		async resolve({ input }) {
			if (input.isRemovingFish) {
				await prisma.fish.deleteMany({
					where: {
						id: {
							in: input.removedFish,
						},
					},
				});
			}
			// todo: add case for fish that are not in tank
			if (input.isRemovingPlants) {
				await prisma.plant.deleteMany({
					where: {
						id: {
							in: input.removedPlants,
						},
					},
				});
			}
			// todo: add case for plants that are not in tank
			await prisma.tank.delete({
				where: {
					id: input.id,
				},
			});
			return {
				status: 202,
			};
		},
	})
	.query('plants', {
		input: z.object({
			id: z.string().cuid(),
		}),
		async resolve({ input }) {
			const plants = await prisma.userPlant.findMany({
				where: {
					user_id: input.id,
				},
			});

			return {
				plants,
			};
		},
	})
	.mutation('addPlant', {
		input: z.object({
			plants: z.array(
				z.object({
					name: z.string().min(1).max(255),
					plant_id: z.string().cuid(),
					user_id: z.string().cuid(),
					tank_id: z.string().cuid(),
					image_url: z.string(),
				})
			),
		}),
		async resolve({ input }) {
			const readyPlants = input.plants.map((plant) => {
				return {
					...plant,
					next_update: new Date().toISOString(),
				};
			});
			await prisma.userPlant.createMany({
				data: readyPlants,
			});

			return {
				status: 201,
			};
		},
	})
	.mutation('updatePlant', {
		input: z.object({
			id: z.string().cuid(),
			name: z.string().min(1).max(255).optional(),
			tank_id: z.string().cuid().optional(),
			image_url: z.string().min(1).max(255).optional(),
			illnesses: z.string().min(1).max(255).optional(),
		}),
		async resolve({ input }) {
			await prisma.userPlant.update({
				where: {
					id: input.id,
				},
				data: {
					...input,
					next_update: new Date(),
				},
			});

			return {
				status: 201,
			};
		},
	})
	.mutation('deletePlant', {
		input: z.object({
			id: z.string().cuid(),
		}),
		async resolve({ input }) {
			await prisma.userPlant.delete({
				where: {
					id: input.id,
				},
			});

			return {
				status: 202,
			};
		},
	});
