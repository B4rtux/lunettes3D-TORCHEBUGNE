/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The structure of a hat entry in the hat database.
 */
type HatDescriptor = {
	resourceName: string;
	position: number;
};

/**
 * The structure of the hat database.
 */
type HatDatabase = {
	[key: string]: HatDescriptor;
};

// Load the database of hats.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HatDatabase: HatDatabase = require('../public/hats.json');

/**
 * WearAHat Application - Showcasing avatar attachments.
 */
export default class WearAHat {
	// Container for preloaded hat prefabs.
	private assets: MRE.AssetContainer;
	private prefabs: { [key: string]: MRE.Prefab } = {};
	// Container for instantiated hats.
	private attachedHats = new Map<MRE.Guid, MRE.Actor>();
	private egg: string;

	/**
	 * Constructs a new instance of this class.
	 * @param context The MRE SDK context.
	 * @param baseUrl The baseUrl to this project's `./public` folder.
	 */
	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {
		this.egg = this.params.egg as string;
		this.assets = new MRE.AssetContainer(context);
		// Hook the context events we're interested in.
		this.context.onStarted(() => this.started());
		this.context.onUserLeft(user => this.userLeft(user));
		this.context.onUserJoined(user => this.userJoin(user));
	}

	/**
	 * Called when a Hats application session starts up.
	 */
	private async started() {
		// Check whether code is running in a debuggable watched filesystem
		// environment and if so delay starting the app by 1 second to give
		// the debugger time to detect that the server has restarted and reconnect.
		// The delay value below is in milliseconds so 1000 is a one second delay.
		// You may need to increase the delay or be able to decrease it depending
		// on the speed of your PC.
		const delay = 1000;
		const argv = process.execArgv.join();
		const isDebug = argv.includes('inspect') || argv.includes('debug');

		// // version to use with non-async code
		// if (isDebug) {
		// 	setTimeout(this.startedImpl, delay);
		// } else {
		// 	this.startedImpl();
		// }

		// version to use with async code
		if (isDebug) {
			await new Promise(resolve => setTimeout(resolve, delay));
			await this.startedImpl();
		} else {
			await this.startedImpl();
		}
	}

	// use () => {} syntax here to get proper scope binding when called via setTimeout()
	// if async is required, next line becomes private startedImpl = async () => {
	private startedImpl = async () => {
		// Preload all the hat models.
		await this.preloadHats();
		// Show the hat menu.
		this.showHatMenu();
	}

	/**
	 * Called when a user leaves the application (probably left the Altspace world where this app is running).
	 * @param user The user that left the building.
	 */
	private userLeft(user: MRE.User) {
		// If the user was wearing a hat, destroy it. Otherwise it would be
		// orphaned in the world.
		this.removeHats(user);
	}


	private userJoin(user: MRE.User) {
		const userId = user.id;
		if (this.egg === "basket") {
			this.assets.loadGltf("basket.glb")
				.then(assets => {
					this.prefabs[this.egg] = assets.find(a => a.prefab !== null) as MRE.Prefab;
					this.attachedHats.set(userId, MRE.Actor.CreateFromPrefab(this.context, {
						prefab: this.prefabs[this.egg],
						actor: {
							transform: {
								local: {
									position: {
										x: 0,
										y: 0.04,
										z: 0.035
									},
									scale: {
										x: 1,
										y: 1,
										z: 0.8
									}
								}
							},
							attachment: {
								attachPoint: "head",
								userId
							}
						}
					}));
				})
				.catch(e => MRE.log.error("app", e));

				// belle merde 
				this.assets.loadGltf("rabbit.glb")
				.then(assets => {
					this.prefabs[this.egg] = assets.find(a => a.prefab !== null) as MRE.Prefab;
					this.attachedHats.set(userId, MRE.Actor.CreateFromPrefab(this.context, {
						prefab: this.prefabs[this.egg],
						actor: {
							transform: {
								local: {
									position: {
										x: 0,
										y:-0.15,
										z: 0
									},
									scale: {
										x: 1,
										y: 1,
										z: -1									}
								}
							},
							attachment: {
								attachPoint: "spine-top",
								userId
							}
						}
					}));
				})
				.catch(e => MRE.log.error("app", e));
				// fin de la belle merde
		}
		if (this.egg === "rabbit") {
			this.assets.loadGltf("rabbit.glb")
				.then(assets => {
					this.prefabs[this.egg] = assets.find(a => a.prefab !== null) as MRE.Prefab;
					this.attachedHats.set(userId, MRE.Actor.CreateFromPrefab(this.context, {
						prefab: this.prefabs[this.egg],
						actor: {
							transform: {
								local: {
									position: {
										x: -0.08,
										y: -0.04,
										z: 0
									},
									scale: {
										x: 0.45,
										y: 0.45,
										z: 0.45
									}
								}
							},
							attachment: {
								attachPoint: "head",
								userId
							}
						}
					}));
				})
				.catch(e => MRE.log.error("app", e));
		}

	}

	/**
	 * Show a menu of hat selections.
	 */
	private showHatMenu() {

		// Create menu button
		this.assets = new MRE.AssetContainer(this.context);
		const buttonMesh = this.assets.createBoxMesh('button', 1, 1, 1);
		const buttonMaterial = this.assets.createMaterial(
			"mat",
			{
				color:
					{ r: 100, g: 0, b: 0, a: 0 },
				alphaMode: MRE.AlphaMode.Blend,
				alphaCutoff: 1
			}
		);

		// Loop over the hat database, creating a menu item for each entry.
		for (const hatId of Object.keys(HatDatabase)) {
			// Create a clickable button.
			if (hatId === this.egg && hatId !== "basket" && hatId !== "rabbit") {

				MRE.Actor.CreateFromPrefab(this.context, {
					prefab: this.prefabs[hatId],
					actor: {
						transform: {
							local: {
								position: {
									x: 0,
									y: -0.5,
									z: 0
								},
								scale: {
									x: 0.4,
									y: 0.4,
									z: 0.4
								}
							}
						},

					}
				})

				const button = MRE.Actor.CreatePrimitive(this.assets, {
					definition: {
						shape: MRE.PrimitiveShape.Box
					},
					actor: {
						name: "Button",
						appearance: { meshId: buttonMesh.id, materialId: buttonMaterial.id },
						collider: { geometry: { shape: MRE.ColliderType.Auto } },
						transform: {
							local: {
								position: {
									x: 0,
									y: -0.25,
									z: 0
								},
								scale: {
									x: 0.3,
									y: 0.5,
									z: 0.3
								}
							}
						}
					}
				});


				// Set a click handler on the button.
				button.setBehavior(MRE.ButtonBehavior)
					.onClick(user => this.wearHat(hatId, user.id));

			}

		}

	}

	/**
	 * Preload all hat resources. This makes instantiating them faster and more efficient.
	 */
	private preloadHats() {
		// Loop over the hat database, preloading each hat resource.
		// Return a promise of all the in-progress load promises. This
		// allows the caller to wait until all hats are done preloading
		// before continuing.
		return Promise.all(
			Object.keys(HatDatabase).map(hatId => {
				const hatRecord = HatDatabase[hatId];
				if (hatRecord.resourceName) {
					return this.assets.loadGltf(hatRecord.resourceName)
						.then(assets => {
							this.prefabs[hatId] = assets.find(a => a.prefab !== null) as MRE.Prefab;
						})
						.catch(e => MRE.log.error("app", e));
				} else {
					return Promise.resolve();
				}
			}));
	}

	/**
	 * Instantiate a hat and attach it to the avatar's head.
	 * @param hatId The id of the hat in the hat database.
	 * @param userId The id of the user we will attach the hat to.
	 */
	private wearHat(hatId: string, userId: MRE.Guid) {
		// If the user is wearing a hat, destroy it.
		this.removeHats(this.context.user(userId));

		const hatRecord = HatDatabase[hatId];

		// If the user selected 'none', then early out.
		if (!hatRecord.resourceName) {
			return;
		}
		const xPosition = (hatRecord.position % 3) - 1;
		const zPosition = Math.floor(hatRecord.position / 3);
		const position = {
			x: (xPosition * 0.075) + 0.03,
			y: -0.35,
			z: (zPosition * 0.075) - 0.04
		};

		// EGG
		this.attachedHats.set(userId, MRE.Actor.CreateFromPrefab(this.context, {
			prefab: this.prefabs[hatId],
			actor: {
				transform: {
					local: {
						position: position,
						scale: {
							x: 0.08,
							y: 0.08,
							z: 0.08,
						}
					}
				},
				attachment: {
					attachPoint: "left-hand",
					userId
				}
			}
		}));
	}

	private removeHats(user: MRE.User) {
		if (this.attachedHats.has(user.id)) { this.attachedHats.get(user.id).destroy(); }
		this.attachedHats.delete(user.id);
	}
}
