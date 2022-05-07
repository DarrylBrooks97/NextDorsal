import Image from 'next/image';
import Spinner from '@components/Spinner';
import TankRemindersCard from '@components/TankReminders';
import TankOverviewCard from '@components/TankOverviewCard';
import { trpc } from '@utils/trpc';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { CheckIcon, Pencil1Icon } from '@radix-ui/react-icons';
import {
	Box,
	BoxProps,
	Center,
	Heading,
	HStack,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	Text,
} from '@chakra-ui/react';
import Error from 'next/error';

const MotionBox = motion<BoxProps>(Box);

const TankOptions: { label: string }[] = [
	{
		label: 'Overview',
	},
	{
		label: 'Reminders',
	},
	{
		label: 'Fish',
	},
	{
		label: 'Plants',
	},
];

const tankCards = [
	TankOverviewCard,
	TankRemindersCard,
	TankRemindersCard,
	TankRemindersCard,
];

export default function Aquarium() {
	const invalidate = trpc.useContext();
	const adder = trpc.useMutation(['user.updateTank'], {
		onSuccess: () => {
			invalidate.invalidateQueries(['user.tanks.byId']);
		},
	});
	const [activeTab, setActiveTab] = useState(0);
	const [editing, setEditing] = useState(false);
	const [tankName, setTankName] = useState('');
	const { id } = useRouter().query;
	const { data } = trpc.useQuery(['user.tanks.byId', { id: id as string }]);

	if (typeof id !== 'string') return;

	const updateTank = async () => {
		if (tankName.length === 0) return;
		adder.mutate(
			{ id, name: tankName },
			{
				onSuccess: () => {
					setEditing(false);
					console.log('success');
				},
				onError: (error: any) => {
					throw new Error(error);
				},
			}
		);
	};

	return (
		<Box w="100vw" p="3" h="full">
			{data ? (
				<Stack
					align="center"
					h="full"
					mt="6"
					spacing={6}
					shouldWrapChildren
				>
					<Box
						w="calc(100vw - 3rem)"
						h="274px"
						pos="relative"
						overflow="hidden"
						borderRadius="15px"
					>
						<Image
							src="https://images.unsplash.com/photo-1619611384968-e45fbd60bc5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
							layout="fill"
							alt="tank image"
						/>
					</Box>
					<HStack>
						{!editing ? (
							<>
								<Heading
									color="white"
									onClick={() => console.log('editing...')}
								>
									{data.tank?.name}
								</Heading>
								<Pencil1Icon
									color="white"
									onClick={() => setEditing(true)}
									style={{
										alignSelf: 'center',
										width: '18px',
										height: '18px',
									}}
								/>
							</>
						) : (
							<InputGroup
								w="calc(100vw - 3rem)"
								variant="flushed"
							>
								<Input
									color="white"
									textAlign="center"
									variant="flushed"
									placeholder={data.tank?.name}
									onChange={(e) =>
										setTankName(e.target.value)
									}
								/>
								<InputRightElement
									onClick={updateTank}
									children={
										<CheckIcon
											color="white"
											style={{
												width: 20,
												height: 20,
											}}
										/>
									}
								/>
							</InputGroup>
						)}
					</HStack>
					<HStack
						p="3"
						h="31px"
						w="full"
						pos="relative"
						spacing={3}
						shouldWrapChildren
					>
						{TankOptions.map((option, index) => (
							<Text
								key={index}
								fontSize="20px"
								color="white"
								pos="relative"
								onClick={() => setActiveTab(index)}
							>
								{option.label}
								{index === activeTab ? (
									<MotionBox
										pos="absolute"
										bottom="-1px"
										left="0"
										right="0"
										h="1px"
										w=""
										bg="white"
										layoutId="active-tab"
									/>
								) : null}
							</Text>
						))}
					</HStack>
					<Center h="full" w="calc(100vw - 3rem)">
						<HStack overflowX="scroll" spacing={6}>
							{tankCards.map((Card, index) => (
								<>
									{index === activeTab ? (
										<Card key={index} id={id} />
									) : null}
								</>
							))}
						</HStack>
					</Center>
				</Stack>
			) : (
				<Center w="100vw" h="100vh">
					<Spinner />
				</Center>
			)}
		</Box>
	);
}
