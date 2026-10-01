import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, StackItem, Switch, Heading, Text,
  Button, Avatar, Banner,
} from "@astryxdesign/core";
import { FormLayout } from "@astryxdesign/core/FormLayout";

export default function OptionsDialog({ isOpen, onOpenChange, value = {}, onChange, sync }) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={480} purpose="form">
      <Layout
        header={<DialogHeader title="Options" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={6}>
              <FormLayout>
                <Switch label="Muster from my collection" value={Boolean(value.useCollection)}
                        onChange={(useCollection) => onChange({ ...value, useCollection })} />
              </FormLayout>

              {/* Kingdoms, armies and the collection follow a Discord account
                  to every device; see sync.mjs. */}
              {sync && (
                <VStack gap={3}>
                  <Heading level={3}>Discord Sync</Heading>
                  {sync.user ? (
                    <HStack gap={3} vAlign="center" wrap="wrap">
                      <Avatar name={sync.user.name} src={sync.user.avatar || undefined} size="sm" />
                      <StackItem size="fill"><Text weight="semibold">{sync.user.name}</Text></StackItem>
                      <Button label="Sync now" variant="secondary" isLoading={sync.busy} onClick={sync.syncNow} />
                      <Button label="Sign out" variant="ghost" onClick={sync.signOut} />
                    </HStack>
                  ) : (
                    <HStack>
                      <Button label="Sign in with Discord" variant="primary" onClick={sync.signIn} />
                    </HStack>
                  )}
                  {sync.error && <Banner status="error" title={sync.error} />}
                </VStack>
              )}
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
