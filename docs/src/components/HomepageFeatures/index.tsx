import Heading from "@theme/Heading";
import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type FeatureItem = {
	title: string;
	Svg: React.ComponentType<React.ComponentProps<"svg">>;
	description: ReactNode;
};

const FeatureList: FeatureItem[] = [
	{
		title: "Type-Safe & Modern",
		Svg: require("@site/static/img/ts-logo.svg").default,
		description: (
			<>
				Built with Nitro Modules for JSI-based performance and complete
				TypeScript support. Full type safety from React Native to Swift with
				automatic code generation.
			</>
		),
	},
	{
		title: "iOS Live Activities",
		Svg: require("@site/static/img/live-activities-icon.svg").default,
		description: (
			<>
				Create beautiful Live Activities that appear in the Dynamic Island and
				Lock Screen. Real-time updates with comprehensive error handling and iOS
				version compatibility.
			</>
		),
	},
	{
		title: "Widget Generation",
		Svg: require("@site/static/img/cli.svg").default,
		description: (
			<>
				Powerful CLI tools to generate SwiftUI widget templates automatically.
				Customizable templates that integrate seamlessly with your Xcode
				project.
			</>
		),
	},
];

function Feature({ title, Svg, description }: FeatureItem) {
	return (
		<div className={clsx("col col--4")}>
			<div className="text--center">
				<Svg className={styles.featureSvg} role="img" />
			</div>
			<div className="text--center padding-horiz--md">
				<Heading as="h3">{title}</Heading>
				<p>{description}</p>
			</div>
		</div>
	);
}

export default function HomepageFeatures(): ReactNode {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	);
}
