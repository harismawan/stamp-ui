import { useState } from 'react';
import {
  StampProvider, Button, Card, CardTitle, CardValue, Input, NumberInput, Modal,
  Checkbox, Switch, Slider, Badge, Tag, Avatar, AvatarGroup, Stat, EmptyState,
  Divider, Progress, Tabs, TabList, Tab, TabPanel, Accordion, AccordionItem,
  VStack, HStack, Tooltip, Popover, Menu, MenuButton, MenuList, MenuItem, Drawer,
  Alert, Breadcrumb, BreadcrumbItem, Pagination, Stepper, Table, THead, TBody,
  Tr, Th, Td, Spinner, toast, ToastViewport, confirmDialog, ConfirmViewport,
  ColorPicker, IconPicker, RadioGroup, Radio,
} from '@harismawan/stamp-ui';

export function Gallery() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState('a');
  return (
    <StampProvider mode={mode}>
      <VStack $gap={5} style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <HStack $gap={3}>
          <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
            Toggle {mode === 'light' ? 'dark' : 'light'}
          </Button>
          <Button $variant="outline" onClick={() => setOpen(true)}>Open modal</Button>
          <Button $variant="ghost" onClick={() => setDrawer(true)}>Open drawer</Button>
          <Button $variant="danger" onClick={() => toast.success('hi')}>Toast</Button>
          <Button onClick={() => confirmDialog({ title: 'Sure?', message: 'Delete it?' })}>Confirm</Button>
        </HStack>
        <HStack $gap={2}>
          <Badge $variant="primary">primary</Badge>
          <Badge $variant="success">ok</Badge>
          <Tag onRemove={() => {}}>removable</Tag>
          <Spinner />
        </HStack>
        <Card><CardTitle>Balance</CardTitle><CardValue>1.000.000</CardValue></Card>
        <Stat label="Net worth" value="12.500.000" delta={4.2} deltaType="up" />
        <Input placeholder="text" />
        <NumberInput value="1000000" onChange={() => {}} />
        <Checkbox label="check me" checked onChange={() => {}} />
        <Switch label="toggle" checked onChange={() => {}} />
        <Slider value={40} onChange={() => {}} />
        <Progress value={60} />
        <RadioGroup name="g" value="x" onChange={() => {}}>
          <Radio value="x" label="X" />
          <Radio value="y" label="Y" />
        </RadioGroup>
        <ColorPicker value="#FFDE15" onChange={() => {}} />
        <IconPicker value="home" onChange={() => {}} />
        <Avatar name="Haris Mawan" /><AvatarGroup max={2}><Avatar name="A B" /><Avatar name="C D" /><Avatar name="E F" /></AvatarGroup>
        <Tabs value={tab} onChange={setTab}>
          <TabList><Tab value="a">A</Tab><Tab value="b">B</Tab></TabList>
          <TabPanel value="a">Panel A</TabPanel><TabPanel value="b">Panel B</TabPanel>
        </Tabs>
        <Accordion type="single">
          <AccordionItem value="1" title="Section 1">Body 1</AccordionItem>
          <AccordionItem value="2" title="Section 2">Body 2</AccordionItem>
        </Accordion>
        <Alert $variant="info" title="Heads up">An inline alert.</Alert>
        <HStack $gap={3}>
          <Tooltip content="tip"><Button>Hover me</Button></Tooltip>
          <Popover trigger={<Button>Popover</Button>}>Popover content</Popover>
          <Menu>
            <MenuButton>Menu</MenuButton>
            <MenuList><MenuItem onSelect={() => {}}>One</MenuItem><MenuItem onSelect={() => {}}>Two</MenuItem></MenuList>
          </Menu>
        </HStack>
        <Breadcrumb><BreadcrumbItem href="/">Home</BreadcrumbItem><BreadcrumbItem>Here</BreadcrumbItem></Breadcrumb>
        <Pagination page={2} pageCount={10} onChange={() => {}} />
        <Stepper active={1} steps={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} />
        <Table><THead><Tr><Th>Name</Th><Th>Amt</Th></Tr></THead><TBody><Tr><Td>Coffee</Td><Td>25.000</Td></Tr></TBody></Table>
        <EmptyState title="Nothing here" description="Add your first item." />
        <Divider label="end" />
        <Modal open={open} onClose={() => setOpen(false)} title="Demo modal">Modal body</Modal>
        <Drawer open={drawer} onClose={() => setDrawer(false)} side="right" title="Demo drawer">Drawer body</Drawer>
      </VStack>
      <ToastViewport />
      <ConfirmViewport />
    </StampProvider>
  );
}
