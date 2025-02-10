/* eslint-disable global-require */
/* eslint-disable import/extensions */
import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Devnet Configuration',
    Svg: require('@site/static/img/devnet_configuration.svg').default,
    description: (
      <>Easily configure Starknet Devnet. Configure blocks, switch between instances...</>
    ),
  },
  {
    title: 'Account Management',
    Svg: require('@site/static/img/account_management.svg').default,
    description: <>List Devnet accounts, deploy new ones. Switch between them seamlessly.</>,
  },
  {
    title: 'Dapp Connection',
    Svg: require('@site/static/img/dapp_connection.svg').default,
    description: (
      <>Connect to Dapps with any account. Send transactions, sign messages and much more.</>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
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
