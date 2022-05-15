var sidebarClose = document.getElementById('sidebar-close')
var sidebar = document.getElementById('sunburst-sidebar')

let sidebarClosed = true

function closeHandler(element: HTMLElement | null) {
	if (!element) return
	if (sidebarClosed) {
		sidebar?.classList.add('closed-sidebar')
		element.innerHTML = `<i class="fas fa-chevron-right"></i>`
	} else {
		sidebar?.classList.remove('closed-sidebar')
		element.innerHTML = `<i class="fas fa-chevron-left"></i>`
	}
	sidebarClosed = !sidebarClosed
}

export const setupSidebarCloseHandler = () => {
	sidebarClose?.addEventListener('click', (e) => closeHandler(e.target as HTMLElement))
	closeHandler(sidebarClose)
}
