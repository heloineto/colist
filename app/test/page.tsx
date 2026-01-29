'use client';

import { CollapsibleNavbar } from '@/deprecated/packages/mantine';
import { NavLink } from '@mantine/core';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';

export default function Page() {
  return (
    <div className="relative h-screen w-screen">
      <CollapsibleNavbar>
        <NavLink
          label="Search"
          component="button"
          leftSection={<MagnifyingGlassIcon size="1.25rem" />}
        />
        <NavLink
          label="With children"
          component="button"
          leftSection={<MagnifyingGlassIcon size="1.25rem" />}
        >
          <NavLink
            label="Search"
            component="button"
            leftSection={<MagnifyingGlassIcon size="1.25rem" />}
          />
          <NavLink
            label="Search"
            component="button"
            leftSection={<MagnifyingGlassIcon size="1.25rem" />}
          />
          <NavLink
            label="Search"
            component="button"
            leftSection={<MagnifyingGlassIcon size="1.25rem" />}
          />
        </NavLink>
        <NavLink
          label="Sub sub children"
          component="button"
          leftSection={<MagnifyingGlassIcon size="1.25rem" />}
        >
          <NavLink
            label="Search"
            component="button"
            leftSection={<MagnifyingGlassIcon size="1.25rem" />}
          >
            <NavLink
              label="Search"
              component="button"
              leftSection={<MagnifyingGlassIcon size="1.25rem" />}
            >
              <NavLink
                label="Search"
                component="button"
                leftSection={<MagnifyingGlassIcon size="1.25rem" />}
              />
            </NavLink>
            <NavLink
              label="Search"
              component="button"
              leftSection={<MagnifyingGlassIcon size="1.25rem" />}
            />
          </NavLink>
          <NavLink
            label="Search"
            component="button"
            leftSection={<MagnifyingGlassIcon size="1.25rem" />}
          />
        </NavLink>
      </CollapsibleNavbar>
    </div>
  );
}
