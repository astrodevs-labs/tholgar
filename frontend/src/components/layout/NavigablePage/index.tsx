import {FC, PropsWithChildren} from "react";
import { useState } from 'react'
import { Box, useBreakpointValue } from '@chakra-ui/react'

import {Header} from 'components/layout/Header'
import {SideBar} from 'components/layout/SideBar'

const smVariant: { navigation: "drawer" | "sidebar", navigationButton: boolean } = { navigation: 'drawer', navigationButton: true }
const mdVariant: { navigation: "drawer" | "sidebar", navigationButton: boolean } = { navigation: 'sidebar', navigationButton: false }

export interface NavigablePageProps {}

export const NavigablePage: FC<PropsWithChildren<NavigablePageProps>> = ({children}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const variants = useBreakpointValue({base: smVariant, md: mdVariant})

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)

  return (
    <>
      <Box ml={!variants?.navigationButton ? "200" : "0"}>
        <Header
          showSidebarButton={variants?.navigationButton}
          onShowSidebar={toggleSidebar}
        />

        {children}
      </Box>
      <SideBar
        variant={variants?.navigation}
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
      />
    </>
  )
}

NavigablePage.defaultProps = {}