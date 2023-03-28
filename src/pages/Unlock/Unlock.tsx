import React, { useEffect } from 'react';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { ExtensionLoginButton } from '@multiversx/sdk-dapp/UI/extension/ExtensionLoginButton';
import { LedgerLoginButton } from '@multiversx/sdk-dapp/UI/ledger/LedgerLoginButton';
import { WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI/walletConnect/WalletConnectLoginButton';
import { WebWalletLoginButton } from '@multiversx/sdk-dapp/UI/webWallet/WebWalletLoginButton';
import { useNavigate } from 'react-router-dom';

import { Extension } from 'assets/Extension';
import { Ledger } from 'assets/Ledger';
import { MultiversX } from 'assets/MultiversX';
import { Wallet } from 'assets/Wallet';
import { xPortal } from 'assets/xPortal';

import { network } from 'config';

import styles from './styles.module.scss';

import type { ConnectionType } from './types';

export const Unlock = () => {
  const { address } = useGetAccountInfo();

  const navigate = useNavigate();
  const connects: ConnectionType[] = [
    {
      title: 'Desktop',
      name: 'MultiversX Web Wallet',
      background: '#000000',
      icon: Wallet,
      component: WebWalletLoginButton
    },
    {
      title: 'Hardware',
      name: 'Ledger',
      background: '#000000',
      icon: Ledger,
      component: LedgerLoginButton
      // innerLedgerComponentsClasses: {
      //   ledgerScamPhishingAlertClassName: 'ledger-modal-phishing',
      //   ledgerProgressBarClassNames: {
      //     ledgerProgressBarTrackClassName: 'ledger-modal-progress-track',
      //     ledgerProgressBarThumbClassName: 'ledger-modal-progress-thumb'
      //   },
      //   ledgerConnectClassNames: {
      //     ledgerModalTitleClassName: 'ledger-modal-title',
      //     ledgerModalSubtitleClassName: 'ledger-modal-subtitle',
      //     ledgerModalIconClassName: 'ledger-modal-icon',
      //     ledgerModalButtonClassName: 'ledger-modal-button',
      //     ledgerModalContentClassName: 'ledger-modal-content',
      //     ledgerModalFooterClassName: 'ledger-modal-footer',
      //     ledgerModalFooterLinkClassName: 'ledger-modal-footer-link',
      //     ledgerModalErrorClassName: 'ledger-modal-error'
      //   },
      //   confirmAddressClassNames: {
      //     ledgerModalTitleClassName: 'ledger-modal-title',
      //     ledgerModalConfirmDescriptionClassName:
      //       'ledger-modal-confirm-description',
      //     ledgerModalConfirmDataClassName: 'ledger-modal-confirm-data',
      //     ledgerModalConfirmFooterClassName: 'ledger-modal-confirm-footer',
      //     ledgerModalConfirmContentClassName: 'ledger-modal-confirm-content'
      //   },
      //   addressTableClassNames: {
      //     ledgerModalTitleClassName: 'ledger-modal-title',
      //     ledgerModalTableHeadClassName: 'ledger-modal-table-head',
      //     ledgerModalTableItemClassName: 'ledger-modal-table-item',
      //     ledgerModalButtonClassName: 'btn btn-primary w-auto m-0',
      //     ledgerModalTableNavigationButtonClassName:
      //       'ledger-modal-navigation-button',
      //     ledgerModalTableNavigationButtonDisabledClassName:
      //       'ledger-modal-navigation-button-disabled',
      //     ledgerModalTableSelectedItemClassName:
      //       'ledger-modal-table-selected-item'
      //   },
      //   ledgerLoadingClassNames: {
      //     ledgerModalTitleClassName: 'ledger-modal-title',
      //     ledgerModalSubtitleClassName: 'ledger-modal-subtitle',
      //     ledgerLoadingWrapper: 'ledger-modal-loading-wrapper',
      //     ledgerLoadingSpinner: 'ledger-modal-loading-spinner'
      //   }
      // }
    },
    {
      title: 'Mobile',
      name: 'xPortal Mobile Wallet',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: xPortal,
      isWalletConnectV2: true,
      component: WalletConnectLoginButton,
      innerWalletConnectComponentsClasses: {
        containerContentClassName: styles.content,
        containerTitleClassName: styles.title,
        containerButtonClassName: styles.button,
        containerSubtitleClassName: styles.subtitle,
        containerScamPhishingAlertClassName: styles.phishing,
        walletConnectPairingListClassNames: {
          leadClassName: styles.lead,
          buttonClassName: styles.pairing
        }
      }
    },
    {
      title: 'Browser',
      name: 'MultiversX DeFi Wallet',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: Extension,
      component: ExtensionLoginButton
    }
  ];

  const redirectConditionally = () => {
    if (Boolean(address)) {
      navigate('/dashboard');
    }
  };

  useEffect(redirectConditionally, [address]);

  return (
    <div className={styles.unlock}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <MultiversX />
        </div>

        <strong className={styles.heading}>
          MultiversX Delegation Manager
        </strong>

        <div className={styles.description}>
          {`Delegate MultiversX (${network.egldLabel}) and earn up to 25% APY!`}
        </div>

        <div className={styles.connects}>
          {connects.map((connect) => (
            <connect.component
              key={connect.name}
              callbackRoute='/dashboard'
              logoutRoute='/unlock'
              {...connect}
            >
              <span className={styles.connect}>
                <span className={styles.title}>{connect.title}</span>

                <span
                  className={styles.icon}
                  style={{ background: connect.background }}
                >
                  <connect.icon />
                </span>

                <span className={styles.name}>{connect.name}</span>
              </span>
            </connect.component>
          ))}
        </div>
      </div>
    </div>
  );
};
